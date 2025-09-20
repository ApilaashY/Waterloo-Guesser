# AWS Deployment Script for WebSocket Server (PowerShell)
# This script deploys the WebSocket server to AWS ECS Fargate

param(
    [string]$ProjectName = "waterloo-guesser-ws",
    [string]$AWSRegion = "us-east-1",
    [string]$MongoDBURI = "your_mongodb_connection_string_here",
    [string]$MongoDBDB = "your_database_name_here",
    [string]$AllowedOrigins = "http://localhost:3000,https://your-vercel-domain.vercel.app"
)

Write-Host "🚀 Starting deployment of WebSocket server to AWS..." -ForegroundColor Green

# Check if AWS CLI is installed
try {
    $null = aws --version
    Write-Host "✅ AWS CLI is available" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Get AWS account ID
try {
    $AWSAccountID = aws sts get-caller-identity --query Account --output text
    Write-Host "✅ AWS Account ID: $AWSAccountID" -ForegroundColor Green
    Write-Host "✅ Region: $AWSRegion" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get AWS Account ID. Please check your AWS credentials." -ForegroundColor Red
    exit 1
}

# Step 1: Deploy VPC infrastructure
Write-Host "📡 Deploying VPC infrastructure..." -ForegroundColor Yellow
$vpcResult = aws cloudformation deploy `
    --template-file aws/01-vpc.yml `
    --stack-name "$ProjectName-vpc" `
    --parameter-overrides ProjectName=$ProjectName `
    --region $AWSRegion `
    --capabilities CAPABILITY_IAM 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VPC infrastructure deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy VPC infrastructure" -ForegroundColor Red
    Write-Host $vpcResult -ForegroundColor Red
    exit 1
}

# Step 2: Deploy ECS infrastructure (without image first)
Write-Host "🏗️ Deploying ECS infrastructure..." -ForegroundColor Yellow
$ecsResult = aws cloudformation deploy `
    --template-file aws/02-ecs-fargate.yml `
    --stack-name "$ProjectName-ecs" `
    --parameter-overrides `
        ProjectName=$ProjectName `
        ImageURI=nginx:latest `
        DesiredCount=1 `
        MongoDBURI="$MongoDBURI" `
        MongoDBDatabase="$MongoDBDB" `
        AllowedOrigins="$AllowedOrigins" `
    --region $AWSRegion `
    --capabilities CAPABILITY_IAM 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ECS infrastructure deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy ECS infrastructure" -ForegroundColor Red
    Write-Host $ecsResult -ForegroundColor Red
    exit 1
}

# Step 3: Get ECR repository URI
$ECRURI = aws cloudformation describe-stacks `
    --stack-name "$ProjectName-ecs" `
    --region $AWSRegion `
    --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' `
    --output text

Write-Host "📦 ECR Repository: $ECRURI" -ForegroundColor Cyan

# Step 4: Authenticate Docker to ECR
Write-Host "🔐 Authenticating Docker to ECR..." -ForegroundColor Yellow
$loginPassword = aws ecr get-login-password --region $AWSRegion
$loginPassword | docker login --username AWS --password-stdin $ECRURI

# Step 5: Build and push Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t "$ProjectName-websocket-server" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
    exit 1
}

Write-Host "🏷️ Tagging Docker image..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker tag "$ProjectName-websocket-server:latest" "$ECRURI:latest"
docker tag "$ProjectName-websocket-server:latest" "$ECRURI:$timestamp"

Write-Host "⬆️ Pushing Docker image to ECR..." -ForegroundColor Yellow
docker push "$ECRURI:latest"
docker push "$ECRURI:$timestamp"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push Docker image" -ForegroundColor Red
    exit 1
}

# Step 6: Update ECS service with new image
Write-Host "🔄 Updating ECS service with new image..." -ForegroundColor Yellow
$updateResult = aws cloudformation deploy `
    --template-file aws/02-ecs-fargate.yml `
    --stack-name "$ProjectName-ecs" `
    --parameter-overrides `
        ProjectName=$ProjectName `
        ImageURI="$ECRURI:latest" `
        DesiredCount=2 `
        MongoDBURI="$MongoDBURI" `
        MongoDBDatabase="$MongoDBDB" `
        AllowedOrigins="$AllowedOrigins" `
    --region $AWSRegion `
    --capabilities CAPABILITY_IAM 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ECS service updated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update ECS service" -ForegroundColor Red
    Write-Host $updateResult -ForegroundColor Red
    exit 1
}

# Step 7: Get the WebSocket endpoint
$WebSocketEndpoint = aws cloudformation describe-stacks `
    --stack-name "$ProjectName-ecs" `
    --region $AWSRegion `
    --query 'Stacks[0].Outputs[?OutputKey==`WebSocketEndpoint`].OutputValue' `
    --output text

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Project Name: $ProjectName" -ForegroundColor White
Write-Host "  AWS Region: $AWSRegion" -ForegroundColor White
Write-Host "  ECR Repository: $ECRURI" -ForegroundColor White
Write-Host "  WebSocket Endpoint: $WebSocketEndpoint" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your WebSocket server is now available at:" -ForegroundColor Green
Write-Host "  $WebSocketEndpoint" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update your frontend to use this WebSocket endpoint" -ForegroundColor White
Write-Host "  2. Test the connection with your application" -ForegroundColor White
Write-Host "  3. Monitor logs in CloudWatch" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitoring:" -ForegroundColor Cyan
Write-Host "  CloudWatch Logs: /ecs/$ProjectName-websocket-server" -ForegroundColor White
Write-Host "  ECS Console: https://console.aws.amazon.com/ecs/home?region=$AWSRegion#/clusters/$ProjectName-cluster" -ForegroundColor White
Write-Host ""
