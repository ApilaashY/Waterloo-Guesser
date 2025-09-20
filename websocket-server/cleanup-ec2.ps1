#!/usr/bin/env pwsh
# Cleanup script for Simple EC2 WebSocket Deployment
# This will remove all AWS resources created by deploy-ec2.ps1

param(
    [string]$Region = "us-east-1",
    [string]$KeyPairName = "waterloo-guesser-ws-key",
    [switch]$Force
)

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param($Message, $Color)
    Write-Host "$Color$Message$Reset"
}

function Confirm-Cleanup {
    if ($Force) {
        return $true
    }
    
    Write-ColorOutput "`n⚠️  WARNING: This will delete ALL resources created by the EC2 deployment!" $Yellow
    Write-ColorOutput "This includes:" $Reset
    Write-ColorOutput "  • EC2 instance (waterloo-guesser-websocket)" $Reset
    Write-ColorOutput "  • Security group (waterloo-guesser-ws-sg)" $Reset
    Write-ColorOutput "  • Key pair ($KeyPairName)" $Reset
    Write-ColorOutput "  • Local key file (secrets/$KeyPairName.pem)" $Reset
    
    $confirmation = Read-Host "`nType 'yes' to continue with cleanup"
    return $confirmation -eq "yes"
}

function Remove-EC2Instance {
    Write-ColorOutput "🔍 Finding EC2 instances..." $Blue
    
    # Find instances with our tag
    $instances = aws ec2 describe-instances --filters "Name=tag:Name,Values=waterloo-guesser-websocket" "Name=instance-state-name,Values=pending,running,stopping,stopped" --region $Region --query 'Reservations[].Instances[].InstanceId' --output text
    
    if ($instances -and $instances.Trim()) {
        $instanceList = $instances.Split()
        Write-ColorOutput "🗑️  Terminating EC2 instances: $($instanceList -join ', ')" $Yellow
        
        aws ec2 terminate-instances --instance-ids $instanceList --region $Region | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ EC2 instances marked for termination" $Green
            Write-ColorOutput "⏳ Waiting for instances to terminate..." $Blue
            aws ec2 wait instance-terminated --instance-ids $instanceList --region $Region
            Write-ColorOutput "✅ EC2 instances terminated" $Green
        } else {
            Write-ColorOutput "❌ Failed to terminate some instances" $Red
        }
    } else {
        Write-ColorOutput "ℹ️  No EC2 instances found to delete" $Blue
    }
}

function Remove-SecurityGroup {
    Write-ColorOutput "🔍 Finding security groups..." $Blue
    
    $sgName = "waterloo-guesser-ws-sg"
    
    # Check if security group exists
    $sgId = aws ec2 describe-security-groups --group-names $sgName --region $Region --query 'SecurityGroups[0].GroupId' --output text 2>$null
    
    if ($LASTEXITCODE -eq 0 -and $sgId -ne "None") {
        Write-ColorOutput "🗑️  Deleting security group: $sgName ($sgId)" $Yellow
        
        aws ec2 delete-security-group --group-id $sgId --region $Region 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Security group deleted" $Green
        } else {
            Write-ColorOutput "⚠️  Could not delete security group (may have dependencies)" $Yellow
            Write-ColorOutput "   Try again in a few minutes after instances are fully terminated" $Reset
        }
    } else {
        Write-ColorOutput "ℹ️  No security group found to delete" $Blue
    }
}

function Remove-KeyPair {
    Write-ColorOutput "🔍 Finding key pairs..." $Blue
    
    # Check if key pair exists
    $keyExists = aws ec2 describe-key-pairs --key-names $KeyPairName --region $Region 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "🗑️  Deleting key pair: $KeyPairName" $Yellow
        
        aws ec2 delete-key-pair --key-name $KeyPairName --region $Region
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Key pair deleted from AWS" $Green
        } else {
            Write-ColorOutput "❌ Failed to delete key pair from AWS" $Red
        }
    } else {
        Write-ColorOutput "ℹ️  No key pair found in AWS to delete" $Blue
    }
    
    # Remove local key file
    if (Test-Path "secrets/$KeyPairName.pem") {
        Write-ColorOutput "🗑️  Deleting local key file: secrets/$KeyPairName.pem" $Yellow
        Remove-Item "secrets/$KeyPairName.pem" -Force
        Write-ColorOutput "✅ Local key file deleted" $Green
    } else {
        Write-ColorOutput "ℹ️  No local key file found to delete" $Blue
    }
}

function Show-RemainingResources {
    Write-ColorOutput "`n🔍 Checking for any remaining resources..." $Blue
    
    # Check for any remaining instances
    $remainingInstances = aws ec2 describe-instances --filters "Name=tag:Name,Values=waterloo-guesser-websocket" "Name=instance-state-name,Values=pending,running,stopping,stopped,shutting-down" --region $Region --query 'Reservations[].Instances[].{Id:InstanceId,State:State.Name}' --output table 2>$null
    
    if ($LASTEXITCODE -eq 0 -and $remainingInstances) {
        Write-ColorOutput "⚠️  Some instances may still be terminating:" $Yellow
        Write-Output $remainingInstances
    }
    
    # Show current AWS costs reminder
    Write-ColorOutput "`n💰 Cost Information:" $Blue
    Write-ColorOutput "   • Terminated instances stop incurring charges immediately" $Green
    Write-ColorOutput "   • Any EBS volumes are deleted with instance termination" $Green
    Write-ColorOutput "   • Check AWS billing console for confirmation" $Reset
}

# Main cleanup flow
Write-ColorOutput "`n🧹 EC2 WebSocket Server Cleanup" $Blue
Write-ColorOutput "Region: $Region" $Reset

if (Confirm-Cleanup) {
    Write-ColorOutput "`n🚀 Starting cleanup process..." $Blue
    
    Remove-EC2Instance
    Start-Sleep -Seconds 10  # Wait a bit for instances to start terminating
    Remove-SecurityGroup
    Remove-KeyPair
    
    Show-RemainingResources
    
    Write-ColorOutput "`n🎉 Cleanup completed!" $Green
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Blue
    Write-ColorOutput "✅ All WebSocket server resources have been cleaned up" $Green
    Write-ColorOutput "💰 Billing for terminated resources will stop immediately" $Green
    Write-ColorOutput "`n📝 Don't forget to:" $Blue
    Write-ColorOutput "   • Remove the WebSocket URL from your Vercel environment variables" $Reset
    Write-ColorOutput "   • Update your frontend to use a different WebSocket server" $Reset
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Blue
} else {
    Write-ColorOutput "`n❌ Cleanup cancelled" $Yellow
    Write-ColorOutput "No resources were deleted" $Reset
}
