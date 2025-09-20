# Cleanup Script for WebSocket Server AWS Resources
# This script removes all AWS resources created for the WebSocket server

param(
    [string]$ProjectName = "waterloo-guesser-ws",
    [string]$AWSRegion = "us-east-1",
    [switch]$Force = $false
)

Write-Host "🧹 Starting cleanup of WebSocket server AWS resources..." -ForegroundColor Yellow

if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to delete all AWS resources for $ProjectName? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Red
        exit 0
    }
}

# Step 1: Delete ECS stack
Write-Host "🗑️ Deleting ECS stack..." -ForegroundColor Yellow
try {
    aws cloudformation delete-stack --stack-name "$ProjectName-ecs" --region $AWSRegion
    Write-Host "✅ ECS stack deletion initiated" -ForegroundColor Green
    
    # Wait for ECS stack deletion
    Write-Host "⏳ Waiting for ECS stack deletion to complete..." -ForegroundColor Yellow
    aws cloudformation wait stack-delete-complete --stack-name "$ProjectName-ecs" --region $AWSRegion
    Write-Host "✅ ECS stack deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ ECS stack may not exist or already deleted" -ForegroundColor Yellow
}

# Step 2: Delete VPC stack
Write-Host "🗑️ Deleting VPC stack..." -ForegroundColor Yellow
try {
    aws cloudformation delete-stack --stack-name "$ProjectName-vpc" --region $AWSRegion
    Write-Host "✅ VPC stack deletion initiated" -ForegroundColor Green
    
    # Wait for VPC stack deletion
    Write-Host "⏳ Waiting for VPC stack deletion to complete..." -ForegroundColor Yellow
    aws cloudformation wait stack-delete-complete --stack-name "$ProjectName-vpc" --region $AWSRegion
    Write-Host "✅ VPC stack deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ VPC stack may not exist or already deleted" -ForegroundColor Yellow
}

# Step 3: Clean up ECR images (optional)
Write-Host "🧹 Cleaning up ECR repository..." -ForegroundColor Yellow
try {
    $ecrRepo = "$ProjectName-websocket-server"
    $images = aws ecr list-images --repository-name $ecrRepo --region $AWSRegion --query 'imageIds[*]' --output json 2>$null
    
    if ($images -and $images -ne "[]") {
        aws ecr batch-delete-image --repository-name $ecrRepo --image-ids $images --region $AWSRegion
        Write-Host "✅ ECR images deleted" -ForegroundColor Green
    }
    
    aws ecr delete-repository --repository-name $ecrRepo --region $AWSRegion --force
    Write-Host "✅ ECR repository deleted" -ForegroundColor Green
} catch {
    Write-Host "⚠️ ECR repository may not exist or already deleted" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  Project Name: $ProjectName" -ForegroundColor White
Write-Host "  AWS Region: $AWSRegion" -ForegroundColor White
Write-Host "  Stacks deleted: $ProjectName-ecs, $ProjectName-vpc" -ForegroundColor White
Write-Host "  ECR repository deleted: $ProjectName-websocket-server" -ForegroundColor White
Write-Host ""
Write-Host "✅ All AWS resources for the WebSocket server have been removed." -ForegroundColor Green
Write-Host ""
