#!/usr/bin/env pwsh
# SSL Setup Script for WebSocket Server

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    [string]$EC2IP = "98.88.78.67",
    [string]$KeyPairName = "waterloo-guesser-ws-key"
)

Write-Host "🔒 Setting up SSL for WebSocket server..." -ForegroundColor Green
Write-Host "Domain: $Domain" -ForegroundColor Yellow
Write-Host "EC2 IP: $EC2IP" -ForegroundColor Yellow

# Create setup script for EC2
$setupScript = @'
#!/bin/bash
set -e

echo "🔧 Installing NGINX and Certbot..."
sudo yum update -y
sudo amazon-linux-extras enable nginx1
sudo yum install -y nginx

# Install Certbot
sudo yum install -y python3-pip
sudo pip3 install certbot certbot-nginx

echo "📝 Creating NGINX configuration..."
sudo tee /etc/nginx/conf.d/websocket.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name WS_DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name WS_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/WS_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/WS_DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "🚀 Starting NGINX..."
sudo systemctl enable nginx
sudo systemctl start nginx

echo "🔒 Obtaining SSL certificate..."
sudo certbot --nginx -d WS_DOMAIN --non-interactive --agree-tos --email admin@WS_DOMAIN

echo "⚡ Restarting NGINX..."
sudo systemctl restart nginx

echo "✅ SSL setup complete!"
echo "Your WebSocket server is now available at: https://WS_DOMAIN"
'@

# Replace domain placeholder
$setupScript = $setupScript -replace "WS_DOMAIN", $Domain

# Save setup script locally
$setupScript | Out-File -FilePath "setup-ssl.sh" -Encoding UTF8

Write-Host "📤 Uploading setup script to EC2..." -ForegroundColor Blue

# Copy to EC2
& scp -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "setup-ssl.sh" "ec2-user@${EC2IP}:/home/ec2-user/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Script copied successfully" -ForegroundColor Green
    
    # Execute setup script
    Write-Host "⚡ Executing SSL setup on EC2..." -ForegroundColor Blue
    & ssh -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "ec2-user@$EC2IP" "chmod +x setup-ssl.sh"
    & ssh -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "ec2-user@$EC2IP" "sudo ./setup-ssl.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SSL setup completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Your WebSocket server is now available at:" -ForegroundColor Green
        Write-Host "   https://$Domain" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Blue
        Write-Host "   1. Update your Vercel environment variable:" -ForegroundColor White
        Write-Host "      NEXT_PUBLIC_WEBSOCKET_URL=https://$Domain" -ForegroundColor Yellow
        Write-Host "   2. Redeploy your frontend to use the new secure endpoint" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Test your secure connection:" -ForegroundColor Blue
        $testUrl = "https://$Domain/health"
        Write-Host "   curl $testUrl" -ForegroundColor Yellow
    } else {
        Write-Host "❌ SSL setup failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to copy script to EC2!" -ForegroundColor Red
}

# Cleanup
if (Test-Path "setup-ssl.sh") {
    Remove-Item "setup-ssl.sh" -Force
}
