#!/usr/bin/env pwsh
# Simple EC2 WebSocket Server Deployment Script
# Clean version without Unicode characters

param(
    [Parameter(Mandatory=$true)]
    [string]$MongoDBURI,
    
    [Parameter(Mandatory=$true)]
    [string]$MongoDBDB,
    
    [string]$AllowedOrigins = "http://localhost:3000",
    
    [string]$InstanceType = "t3.small",
    
    [string]$Region = "us-east-1",
    
    [string]$KeyPairName = "waterloo-guesser-ws-key"
)

function Write-ColorOutput {
    param($Message, $Color)
    if ($Color -eq "Green") {
        Write-Host $Message -ForegroundColor Green
    } elseif ($Color -eq "Red") {
        Write-Host $Message -ForegroundColor Red
    } elseif ($Color -eq "Yellow") {
        Write-Host $Message -ForegroundColor Yellow
    } elseif ($Color -eq "Blue") {
        Write-Host $Message -ForegroundColor Blue
    } else {
        Write-Host $Message
    }
}

function Test-Prerequisites {
    Write-ColorOutput "Checking prerequisites..." "Blue"
    
    # Check AWS CLI
    try {
        $awsVersion = aws --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "AWS CLI found: $awsVersion" "Green"
        } else {
            throw "AWS CLI not found"
        }
    } catch {
        Write-ColorOutput "AWS CLI not installed or configured" "Red"
        Write-ColorOutput "Please install AWS CLI and run 'aws configure'" "Yellow"
        exit 1
    }
    
    # Check AWS credentials
    try {
        $identity = aws sts get-caller-identity --output text 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "AWS credentials configured" "Green"
        } else {
            throw "AWS credentials not configured"
        }
    } catch {
        Write-ColorOutput "AWS credentials not configured" "Red"
        Write-ColorOutput "Please run 'aws configure'" "Yellow"
        exit 1
    }
    
    Write-ColorOutput "All prerequisites met!" "Green"
}

function New-KeyPair {
    Write-ColorOutput "Creating EC2 Key Pair..." "Blue"
    
    # Check if key pair already exists
    $existingKey = aws ec2 describe-key-pairs --key-names $KeyPairName --region $Region 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Key pair '$KeyPairName' already exists" "Green"
        return
    }
    
    # Create key pair
    $keyOutput = aws ec2 create-key-pair --key-name $KeyPairName --region $Region --output text --query 'KeyMaterial'
    if ($LASTEXITCODE -eq 0) {
        # Save private key
        $keyOutput | Out-File -FilePath "secrets/$KeyPairName.pem" -Encoding ASCII
        Write-ColorOutput "Key pair created: secrets/$KeyPairName.pem" "Green"
        Write-ColorOutput "IMPORTANT: Keep this file safe - you need it to SSH to your server!" "Yellow"
    } else {
        Write-ColorOutput "Failed to create key pair" "Red"
        exit 1
    }
}

function New-SecurityGroup {
    Write-ColorOutput "Creating Security Group..." "Blue"
    
    $sgName = "waterloo-guesser-ws-sg"
    
    # Check if security group exists
    $existingSG = aws ec2 describe-security-groups --group-names $sgName --region $Region 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Security group '$sgName' already exists" "Green"
        $sgId = aws ec2 describe-security-groups --group-names $sgName --region $Region --query 'SecurityGroups[0].GroupId' --output text
        Write-ColorOutput "Using existing security group ID: $sgId" "Blue"
        return $sgId
    }
    
    # Create security group
    $sgId = aws ec2 create-security-group --group-name $sgName --description "Security group for Waterloo Guesser WebSocket server" --region $Region --query 'GroupId' --output text
    
    if ($LASTEXITCODE -eq 0 -and $sgId) {
        Write-ColorOutput "Security group created: $sgId" "Green"
        
        # Add inbound rules
        Write-ColorOutput "Adding security group rules..." "Blue"
        
        # SSH access
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $Region | Out-Null
        
        # HTTP access
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $Region | Out-Null
        
        # WebSocket access
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 3001 --cidr 0.0.0.0/0 --region $Region | Out-Null
        
        # HTTPS access (optional)
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $Region | Out-Null
        
        Write-ColorOutput "Security group rules added" "Green"
        Write-ColorOutput "Returning security group ID: $sgId" "Blue"
        
        return $sgId
    } else {
        Write-ColorOutput "Failed to create security group" "Red"
        Write-ColorOutput "Security group ID was: $sgId" "Red"
        exit 1
    }
}

function New-EC2Instance {
    param($SecurityGroupId)
    
    Write-ColorOutput "Launching EC2 Instance..." "Blue"
    
    # Get latest Amazon Linux 2023 AMI
    $amiId = aws ec2 describe-images --owners amazon --filters "Name=name,Values=al2023-ami-*" "Name=architecture,Values=x86_64" --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' --output text --region $Region
    
    Write-ColorOutput "Using AMI: $amiId" "Blue"
    
    # Create user data script
    $userData = @"
#!/bin/bash
yum update -y
yum install -y docker git

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-`$(uname -s)-`$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /home/ec2-user/waterloo-guesser-ws
chown ec2-user:ec2-user /home/ec2-user/waterloo-guesser-ws

# Signal that setup is complete
echo "Setup complete" > /home/ec2-user/setup-complete.txt
"@
    
    # Encode user data
    $userDataEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($userData))
    
    # Launch instance
    $instanceId = aws ec2 run-instances --image-id $amiId --count 1 --instance-type $InstanceType --key-name $KeyPairName --security-group-ids $SecurityGroupId --user-data $userDataEncoded --region $Region --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=waterloo-guesser-websocket}]' --query 'Instances[0].InstanceId' --output text
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Instance launched: $instanceId" "Green"
        Write-ColorOutput "Waiting for instance to be running..." "Yellow"
        
        # Wait for instance to be running
        aws ec2 wait instance-running --instance-ids $instanceId --region $Region
        
        # Get public IP
        $publicIp = aws ec2 describe-instances --instance-ids $instanceId --region $Region --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
        
        Write-ColorOutput "Instance is running!" "Green"
        Write-ColorOutput "Public IP: $publicIp" "Blue"
        
        return @{
            InstanceId = $instanceId
            PublicIp = $publicIp
        }
    } else {
        Write-ColorOutput "Failed to launch instance" "Red"
        exit 1
    }
}

function Deploy-Application {
    param($InstanceInfo)
    
    Write-ColorOutput "Deploying application to instance..." "Blue"
    Write-ColorOutput "Waiting for instance to complete initialization (this may take 2-3 minutes)..." "Yellow"
    
    # Wait a bit for user data script to complete
    Start-Sleep -Seconds 120
    
    # Create deployment files locally
    $deployFiles = @()
    
    # Create .env file
    $envContent = @"
NODE_ENV=production
PORT=3001
MONGODB_URI=$MongoDBURI
MONGODB_DB=$MongoDBDB
ALLOWED_ORIGINS=$AllowedOrigins
"@
    $envPath = "deployment.env"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    $deployFiles += $envPath
    
    # Create docker-compose.yml
    $composeContent = @"
version: '3.8'
services:
  websocket-server:
    build: .
    ports:
      - "3001:3001"
      - "80:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
"@
    $composePath = "deployment-docker-compose.yml"
    $composeContent | Out-File -FilePath $composePath -Encoding UTF8
    $deployFiles += $composePath
    
    # Create deployment script
    $deployScript = @"
#!/bin/bash
cd /home/ec2-user/waterloo-guesser-ws

# Copy environment file
cp deployment.env .env

# Copy docker-compose file
cp deployment-docker-compose.yml docker-compose.yml

# Build and start the application
docker-compose up -d

# Wait for health check
echo "Waiting for application to start..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "Application is healthy!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 10
done

echo "Deployment complete!"
docker-compose ps
"@
    $scriptPath = "deploy-app.sh"
    $deployScript | Out-File -FilePath $scriptPath -Encoding UTF8
    $deployFiles += $scriptPath
    
    # Copy files to instance
    Write-ColorOutput "Copying files to instance..." "Blue"
    
    # Copy application files
    & scp -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no -r server.js package.json handlers types lib Dockerfile $deployFiles "ec2-user@$($InstanceInfo.PublicIp):/home/ec2-user/waterloo-guesser-ws/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Files copied successfully" "Green"
        
        # Execute deployment script
        Write-ColorOutput "Starting deployment on server..." "Blue"
        & ssh -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "ec2-user@$($InstanceInfo.PublicIp)" "chmod +x /home/ec2-user/waterloo-guesser-ws/deploy-app.sh; /home/ec2-user/waterloo-guesser-ws/deploy-app.sh"
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Application deployed successfully!" "Green"
        } else {
            Write-ColorOutput "Deployment failed" "Red"
            Write-ColorOutput "Try connecting via SSH to debug: ssh -i secrets/$KeyPairName.pem ec2-user@$($InstanceInfo.PublicIp)" "Yellow"
        }
    } else {
        Write-ColorOutput "Failed to copy files to instance" "Red"
        Write-ColorOutput "Make sure the instance is accessible and the key file exists" "Yellow"
    }
    
    # Clean up temporary files
    $deployFiles | ForEach-Object { Remove-Item $_ -ErrorAction SilentlyContinue }
    Remove-Item $scriptPath -ErrorAction SilentlyContinue
}

function Test-Deployment {
    param($PublicIp)
    
    Write-ColorOutput "Testing deployment..." "Blue"
    
    # Test health endpoint
    try {
        $response = Invoke-RestMethod -Uri "http://$PublicIp/health" -TimeoutSec 10
        if ($response.status -eq "healthy") {
            Write-ColorOutput "Health check passed!" "Green"
        } else {
            Write-ColorOutput "Health check returned unexpected response" "Yellow"
        }
    } catch {
        Write-ColorOutput "Health check failed - application may still be starting" "Red"
        Write-ColorOutput "Try accessing http://$PublicIp/health in your browser" "Yellow"
    }
}

# Main deployment flow
Write-ColorOutput "" ""
Write-ColorOutput "Starting Simple EC2 WebSocket Deployment" "Blue"
Write-ColorOutput "This will create a single EC2 instance for your WebSocket server" "Blue"
Write-ColorOutput "Cost: ~$10-15/month (much less than ECS setup)" "Green"
Write-ColorOutput "" ""

Test-Prerequisites

New-KeyPair

$securityGroupId = New-SecurityGroup
Write-ColorOutput "Security group ID received: $securityGroupId" "Blue"

if (-not $securityGroupId -or $securityGroupId.Trim() -eq "") {
    Write-ColorOutput "Failed to get security group ID" "Red"
    exit 1
}

$instanceInfo = New-EC2Instance -SecurityGroupId $securityGroupId

Deploy-Application -InstanceInfo $instanceInfo

Test-Deployment -PublicIp $instanceInfo.PublicIp

# Output success information
Write-ColorOutput "" ""
Write-ColorOutput "Deployment completed!" "Green"
Write-ColorOutput "================================================" "Blue"
Write-ColorOutput "Instance Details:" "Blue"
Write-ColorOutput "   Instance ID: $($instanceInfo.InstanceId)" ""
Write-ColorOutput "   Public IP: $($instanceInfo.PublicIp)" ""
Write-ColorOutput "   Instance Type: $InstanceType" ""
Write-ColorOutput "   Region: $Region" ""
Write-ColorOutput "" ""
Write-ColorOutput "WebSocket Endpoint:" "Blue"
Write-ColorOutput "   http://$($instanceInfo.PublicIp):3001" "Green"
Write-ColorOutput "" ""
Write-ColorOutput "Health Check:" "Blue"
Write-ColorOutput "   http://$($instanceInfo.PublicIp)/health" "Green"
Write-ColorOutput "" ""
Write-ColorOutput "SSH Access:" "Blue"
Write-ColorOutput "   ssh -i secrets/$KeyPairName.pem ec2-user@$($instanceInfo.PublicIp)" "Yellow"
Write-ColorOutput "" ""
Write-ColorOutput "Next Steps:" "Blue"
Write-ColorOutput "   1. Set up SSL for production use:" ""
Write-ColorOutput "      .\setup-ssl.ps1 -Domain 'ws.uwguesser.com'" "Yellow"
Write-ColorOutput "   2. Update your Vercel environment variable:" ""
Write-ColorOutput "      For SSL: NEXT_PUBLIC_WEBSOCKET_URL=https://ws.uwguesser.com" "Green"
Write-ColorOutput "      For testing: NEXT_PUBLIC_WEBSOCKET_URL=http://$($instanceInfo.PublicIp):3001" "Yellow"
Write-ColorOutput "   3. Test your multiplayer functionality" ""
Write-ColorOutput "   4. Monitor logs: ssh to server and run 'docker-compose logs -f'" ""
Write-ColorOutput "" ""
Write-ColorOutput "Estimated Monthly Cost: ~$10-15" "Green"
Write-ColorOutput "================================================" "Blue"
