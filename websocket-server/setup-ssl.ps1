#!/usr/bin/env pwsh
# SSL Setup Script for WebSocket Server
# This script sets up NGINX with SSL certificate for HTTPS WebSocket connections

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,  # e.g., ws.uwguesser.com
    
    [string]$EC2IP = "98.88.78.67",
    
    [string]$KeyPairName = "waterloo-guesser-ws-key"
)

Write-Host "🔒 Setting up SSL for WebSocket server..." -ForegroundColor Green
Write-Host "Domain: $Domain" -ForegroundColor Yellow
Write-Host "EC2 IP: $EC2IP" -ForegroundColor Yellow

# Step 1: Create NGINX configuration
$nginxConfig = @"
server {
    listen 80;
    server_name $Domain;
    
    # Redirect HTTP to HTTPS
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $Domain;
    
    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$Domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$Domain/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Proxy to WebSocket server
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        
        # WebSocket specific
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade `$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@

# Step 2: Create setup script for EC2
$setupScript = @"
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
$nginxConfig
EOF

echo "🔥 Configuring firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

echo "🚀 Starting NGINX..."
sudo systemctl enable nginx
sudo systemctl start nginx

echo "🔒 Obtaining SSL certificate..."
sudo certbot --nginx -d $Domain --non-interactive --agree-tos --email admin@$Domain

echo "⚡ Restarting NGINX..."
sudo systemctl restart nginx

echo "✅ SSL setup complete!"
echo "Your WebSocket server is now available at: https://$Domain"
"@

# Step 3: Copy and execute on EC2
Write-Host "📤 Uploading setup script to EC2..." -ForegroundColor Blue

# Save setup script locally
$setupScript | Out-File -FilePath "setup-ssl.sh" -Encoding UTF8

# Copy to EC2
& scp -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "setup-ssl.sh" "ec2-user@${EC2IP}:/home/ec2-user/"

# Execute setup script
Write-Host "⚡ Executing SSL setup on EC2..." -ForegroundColor Blue
& ssh -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "ec2-user@$EC2IP" "chmod +x setup-ssl.sh"
& ssh -i "secrets/$KeyPairName.pem" -o StrictHostKeyChecking=no "ec2-user@$EC2IP" "sudo ./setup-ssl.sh"

# Cleanup
Remove-Item "setup-ssl.sh" -Force

Write-Host "✅ SSL setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your WebSocket server is now available at:" -ForegroundColor Green
Write-Host "   https://$Domain" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Blue
Write-Host "   1. Update your Vercel environment variable to:" -ForegroundColor White
Write-Host "      NEXT_PUBLIC_WEBSOCKET_URL=https://$Domain" -ForegroundColor Yellow
Write-Host "   2. Redeploy your frontend to use the new secure endpoint" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Test your secure connection:" -ForegroundColor Blue
Write-Host "   curl https://$Domain/health" -ForegroundColor Yellow
