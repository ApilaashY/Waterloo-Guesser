#!/bin/bash

# AWS Deployment Script for WebSocket Server
# This script deploys the WebSocket server to AWS ECS Fargate

set -e  # Exit on any error

# Configuration
PROJECT_NAME="waterloo-guesser-ws"
AWS_REGION="us-east-1"  # Change this to your preferred region
MONGODB_URI="your_mongodb_connection_string_here"  # Replace with your MongoDB URI
MONGODB_DB="your_database_name_here"  # Replace with your database name
ALLOWED_ORIGINS="http://localhost:3000,https://your-vercel-domain.vercel.app"  # Update with your domains

echo "🚀 Starting deployment of WebSocket server to AWS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ Failed to get AWS Account ID. Please check your AWS credentials."
    exit 1
fi

echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"
echo "✅ Region: $AWS_REGION"

# Step 1: Deploy VPC infrastructure
echo "📡 Deploying VPC infrastructure..."
aws cloudformation deploy \
    --template-file aws/01-vpc.yml \
    --stack-name ${PROJECT_NAME}-vpc \
    --parameter-overrides ProjectName=$PROJECT_NAME \
    --region $AWS_REGION \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo "✅ VPC infrastructure deployed successfully"
else
    echo "❌ Failed to deploy VPC infrastructure"
    exit 1
fi

# Step 2: Deploy ECS infrastructure (without image first)
echo "🏗️ Deploying ECS infrastructure..."
aws cloudformation deploy \
    --template-file aws/02-ecs-fargate.yml \
    --stack-name ${PROJECT_NAME}-ecs \
    --parameter-overrides \
        ProjectName=$PROJECT_NAME \
        ImageURI=nginx:latest \
        DesiredCount=1 \
        MongoDBURI="$MONGODB_URI" \
        MongoDBDatabase="$MONGODB_DB" \
        AllowedOrigins="$ALLOWED_ORIGINS" \
    --region $AWS_REGION \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo "✅ ECS infrastructure deployed successfully"
else
    echo "❌ Failed to deploy ECS infrastructure"
    exit 1
fi

# Step 3: Get ECR repository URI
ECR_URI=$(aws cloudformation describe-stacks \
    --stack-name ${PROJECT_NAME}-ecs \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' \
    --output text)

echo "📦 ECR Repository: $ECR_URI"

# Step 4: Authenticate Docker to ECR
echo "🔐 Authenticating Docker to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

# Step 5: Build and push Docker image
echo "🐳 Building Docker image..."
docker build -t ${PROJECT_NAME}-websocket-server .

echo "🏷️ Tagging Docker image..."
docker tag ${PROJECT_NAME}-websocket-server:latest $ECR_URI:latest
docker tag ${PROJECT_NAME}-websocket-server:latest $ECR_URI:$(date +%Y%m%d-%H%M%S)

echo "⬆️ Pushing Docker image to ECR..."
docker push $ECR_URI:latest
docker push $ECR_URI:$(date +%Y%m%d-%H%M%S)

# Step 6: Update ECS service with new image
echo "🔄 Updating ECS service with new image..."
aws cloudformation deploy \
    --template-file aws/02-ecs-fargate.yml \
    --stack-name ${PROJECT_NAME}-ecs \
    --parameter-overrides \
        ProjectName=$PROJECT_NAME \
        ImageURI=$ECR_URI:latest \
        DesiredCount=2 \
        MongoDBURI="$MONGODB_URI" \
        MongoDBDatabase="$MONGODB_DB" \
        AllowedOrigins="$ALLOWED_ORIGINS" \
    --region $AWS_REGION \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo "✅ ECS service updated successfully"
else
    echo "❌ Failed to update ECS service"
    exit 1
fi

# Step 7: Get the WebSocket endpoint
WEBSOCKET_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name ${PROJECT_NAME}-ecs \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebSocketEndpoint`].OutputValue' \
    --output text)

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "  Project Name: $PROJECT_NAME"
echo "  AWS Region: $AWS_REGION"
echo "  ECR Repository: $ECR_URI"
echo "  WebSocket Endpoint: $WEBSOCKET_ENDPOINT"
echo ""
echo "🔗 Your WebSocket server is now available at:"
echo "  $WEBSOCKET_ENDPOINT"
echo ""
echo "📝 Next steps:"
echo "  1. Update your frontend to use this WebSocket endpoint"
echo "  2. Test the connection with your application"
echo "  3. Monitor logs in CloudWatch"
echo ""
echo "📊 Monitoring:"
echo "  CloudWatch Logs: /ecs/${PROJECT_NAME}-websocket-server"
echo "  ECS Console: https://console.aws.amazon.com/ecs/home?region=${AWS_REGION}#/clusters/${PROJECT_NAME}-cluster"
echo ""
