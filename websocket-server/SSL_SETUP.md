# SSL/HTTPS Setup for WebSocket Server

This guide explains how to set up SSL/HTTPS for your WebSocket server to fix the mixed content error.

## Problem

Your frontend (`https://www.uwguesser.com`) runs on HTTPS but the WebSocket server (`ws://98.88.78.67:3001`) runs on HTTP. Browsers block this mixed content for security reasons.

## Solution

Set up an NGINX reverse proxy with SSL certificate to enable `wss://` (secure WebSocket) connections.

## Prerequisites

1. **Domain Name**: You need a domain or subdomain pointing to your EC2 instance
   - Example: `ws.uwguesser.com` or `api.uwguesser.com`
   - Set up an A record pointing to `98.88.78.67`

2. **DNS Configuration**: 
   ```
   Type: A
   Name: ws
   Value: 98.88.78.67
   TTL: 300
   ```

## Quick Setup

### Option 1: Automated SSL Setup (Recommended)

1. **Set up DNS first** - Create an A record for your subdomain (e.g., `ws.uwguesser.com`) pointing to `98.88.78.67`

2. **Run the SSL setup script**:
   ```powershell
   .\setup-ssl.ps1 -Domain "ws.uwguesser.com"
   ```

   This script will:
   - Install NGINX on your EC2 instance
   - Configure it as a reverse proxy
   - Obtain a free SSL certificate from Let's Encrypt
   - Set up automatic HTTPS redirects

3. **Update your frontend environment**:
   ```env
   NEXT_PUBLIC_WEBSOCKET_URL=https://ws.uwguesser.com
   ```

4. **Redeploy your frontend** on Vercel with the new environment variable

### Option 2: Manual Setup

If you prefer manual setup or need to troubleshoot:

1. **SSH into your EC2 instance**:
   ```bash
   ssh -i "secrets/waterloo-guesser-ws-key.pem" ec2-user@98.88.78.67
   ```

2. **Install NGINX**:
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras enable nginx1
   sudo yum install -y nginx
   ```

3. **Install Certbot**:
   ```bash
   sudo yum install -y python3-pip
   sudo pip3 install certbot certbot-nginx
   ```

4. **Create NGINX configuration**:
   ```bash
   sudo nano /etc/nginx/conf.d/websocket.conf
   ```

   Add the configuration from the setup script (see `setup-ssl.ps1` for the exact config).

5. **Start NGINX**:
   ```bash
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

6. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com --non-interactive --agree-tos --email your-email@domain.com
   ```

## Testing

### 1. Test HTTP to HTTPS redirect:
```bash
curl -I http://ws.uwguesser.com
# Should return 301 redirect to https://
```

### 2. Test HTTPS health check:
```bash
curl https://ws.uwguesser.com/health
# Should return {"status": "ok", "timestamp": "..."}
```

### 3. Test WebSocket connection:
Open browser console on `https://www.uwguesser.com` and run:
```javascript
const socket = io('https://ws.uwguesser.com');
socket.on('connect', () => console.log('Connected securely!'));
```

## Architecture After SSL Setup

```
Frontend (HTTPS)          NGINX Proxy (HTTPS)          WebSocket Server (HTTP)
https://uwguesser.com  →   https://ws.uwguesser.com  →   http://localhost:3001
     WSS connection             SSL termination               Local connection
```

## Security Benefits

- ✅ Eliminates mixed content warnings
- ✅ Encrypts WebSocket traffic
- ✅ Provides SSL certificate validation
- ✅ Enables modern browser security features
- ✅ SEO and trust improvements

## Cost Impact

- **SSL Certificate**: Free (Let's Encrypt)
- **NGINX**: No additional cost (runs on same EC2 instance)
- **Total**: No additional monthly cost

## Automatic Certificate Renewal

Certbot automatically sets up cron jobs for certificate renewal. Check with:
```bash
sudo systemctl status certbot-renew.timer
```

## Troubleshooting

### Common Issues:

1. **DNS not propagated**:
   ```bash
   nslookup ws.uwguesser.com
   ```
   Wait for DNS to propagate (can take up to 24 hours).

2. **Certificate failed**:
   - Ensure domain points to correct IP
   - Check port 80 is accessible
   - Verify no other service is using port 80

3. **WebSocket not connecting**:
   - Check NGINX proxy configuration
   - Verify WebSocket server is running on port 3001
   - Test connection with browser dev tools

4. **NGINX not starting**:
   ```bash
   sudo nginx -t  # Test configuration
   sudo systemctl status nginx
   sudo journalctl -u nginx
   ```

## Alternative Solutions

### Option A: Use Cloudflare (If you want CDN benefits)
1. Set up Cloudflare for your domain
2. Enable "Full (strict)" SSL mode
3. Use Cloudflare's WebSocket proxy features

### Option B: Application Load Balancer (For high traffic)
If you expect very high traffic, consider AWS Application Load Balancer with SSL termination (adds ~$16/month).

## Monitoring

### SSL Certificate Status:
```bash
sudo certbot certificates
```

### NGINX Logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### SSL Grade Test:
Test your SSL configuration at: https://www.ssllabs.com/ssltest/
