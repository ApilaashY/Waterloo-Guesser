# WebSocket Server for Waterloo Guesser

This is the WebSocket server for the Waterloo Guesser multiplayer game. It handles real-time communication between players for the versus game mode.

## Current Deployment: AWS EC2

The server is currently deployed using a simple AWS EC2 instance with Docker containers. This approach is cost-effective and suitable for the current scale (40-200 concurrent users).

**Current Production Server**: `https://ws.uwguesser.com` (SSL-enabled)
- **Fallback**: `http://98.88.78.67:3001` (for development only)

## Prerequisites

1. **AWS CLI** - [Install AWS CLI](https://aws.amazon.com/cli/)
2. **Docker** - [Install Docker](https://www.docker.com/get-started)
3. **AWS Account** with appropriate permissions
4. **MongoDB Database** (MongoDB Atlas recommended)
5. **SSH Key Pair** for EC2 access
6. **Domain Name** - Required for SSL setup (e.g., `ws.uwguesser.com`)

## Quick Start (EC2 Deployment)

### 1. Configure AWS Credentials

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format: `json`

### 2. Set Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
NODE_ENV=production
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=waterloo_guesser

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://uwguesser.com,https://www.uwguesser.com
```

### 3. Deploy to AWS EC2

Run the clean deployment script:
```powershell
.\deploy-ec2-clean.ps1
```

This script will:
- Create an EC2 t3.small instance
- Set up security groups for WebSocket traffic
- Install Docker and Docker Compose
- Deploy the WebSocket server container
- Configure health checks

### 4. Set Up SSL (Required for Production)

✅ **SSL is already configured for `ws.uwguesser.com`**

For production use with HTTPS frontends, SSL has been set up with:
- NGINX reverse proxy with SSL termination
- Free SSL certificate from Let's Encrypt
- Secure WebSocket connections (WSS)
- Automatic certificate renewal

**Current secure endpoint**: `https://ws.uwguesser.com`

See `SSL_SETUP.md` for detailed setup instructions if you need to configure additional domains.

### 5. Connect Frontend

After deployment, update your Vercel environment variables:
```env
NEXT_PUBLIC_WEBSOCKET_URL=https://ws.uwguesser.com
```

For development/testing (non-HTTPS), you can use:
```env
NEXT_PUBLIC_WEBSOCKET_URL=http://98.88.78.67:3001
```

## File Structure

### Active Files (Currently Used)
- `server.js` - Main WebSocket server with Express and Socket.IO
- `Dockerfile` - Container configuration
- `package.json` - Node.js dependencies
- `deploy-ec2-clean.ps1` - Current deployment script
- `cleanup-ec2.ps1` - Clean up AWS resources
- `handlers/` - Socket.IO event handlers
- `lib/` - Database and utility modules
- `types/` - TypeScript type definitions

### Testing & Development
- `test.html` - WebSocket client test page
- `dev.ps1` - Local development startup script
- `.env.example` - Environment template
- `TESTING.md` - Testing procedures
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

### Documentation
- `EC2_DEPLOYMENT.md` - Detailed EC2 deployment guide
- `PREREQUISITES.md` - Setup requirements

### Alternative Deployment Methods
See the `unused-deployment-methods/` folder for:
- AWS ECS/Fargate CloudFormation templates
- Railway deployment guide
- Alternative deployment and SSL setup scripts
- nginx configuration templates and docker-compose variants
- Complex orchestration setups

These are kept for reference but not currently used in production.

## Current Infrastructure

### AWS EC2 Instance
- **Instance Type**: t3.small
- **Region**: us-east-1
- **OS**: Amazon Linux 2
- **Storage**: 8GB gp3
- **Network**: VPC with public subnet
- **Security Groups**: SSH (22), HTTP (80), WebSocket (3001), HTTPS (443)

### Cost Estimation
- **EC2 Instance**: ~$15/month (t3.small)
- **Data Transfer**: ~$1-5/month
- **Storage**: ~$1/month
- **Total**: ~$17-21/month

Much more cost-effective than ECS Fargate (~$33-49/month).

## Monitoring & Maintenance

### Health Check
```bash
# For SSL-enabled (production)
curl https://ws.uwguesser.com/health

# For development
curl http://98.88.78.67:3001/health
```

### SSH Access
```bash
ssh -i "secrets/waterloo-guesser-ws-key.pem" ec2-user@98.88.78.67
```

### Container Logs
```bash
# SSH into instance first
docker-compose logs -f websocket-server
```

### Restart Services
```bash
# SSH into instance first
docker-compose restart
```

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or
.\dev.ps1
```

### Testing WebSocket Connection
Open `test.html` in a browser to test WebSocket connectivity.

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check EC2 instance is running
   - Verify security groups allow port 3001
   - Check Docker containers are running

2. **MongoDB Connection Failed**
   - Verify MongoDB URI in environment variables
   - Check MongoDB Atlas network access settings
   - Ensure database exists

3. **CORS Issues**
   - Update ALLOWED_ORIGINS in environment
   - Restart Docker containers after env changes

4. **SSH Access Issues**
   - Verify key pair permissions: `chmod 400 waterloo-guesser-ws-key.pem`
   - Check security group allows SSH from your IP

### Useful Commands

```bash
# Check instance status
aws ec2 describe-instances --instance-ids i-YOUR_INSTANCE_ID

# View instance console output
aws ec2 get-console-output --instance-id i-YOUR_INSTANCE_ID

# Restart EC2 instance
aws ec2 reboot-instances --instance-ids i-YOUR_INSTANCE_ID
```

## Security Considerations

1. **SSL/HTTPS**: **REQUIRED** for production use with HTTPS frontends
   - Use `setup-ssl.ps1` to configure SSL certificates
   - Browsers block mixed content (HTTPS → HTTP WebSocket)
   - Free SSL certificates via Let's Encrypt

2. **Environment Variables**: Never commit `.env` files with production secrets
3. **MongoDB**: Use strong passwords and IP whitelisting
4. **SSH Keys**: Keep private keys secure, use proper permissions
5. **Security Groups**: Restrict access to necessary ports only
6. **Updates**: Regularly update instance and container images

### SSL Setup (REQUIRED for Production)

If your frontend runs on HTTPS (like `https://uwguesser.com`), you MUST set up SSL for your WebSocket server:

```powershell
# Set up DNS A record first: ws.uwguesser.com → 98.88.78.67
.\setup-ssl.ps1 -Domain "ws.uwguesser.com"
```

See `SSL_SETUP.md` for detailed instructions.

## Cleanup

To remove all AWS resources:
```powershell
.\cleanup-ec2.ps1
```

This will delete the EC2 instance, security groups, and key pairs.

## Alternative Deployment Methods

If you need to explore other deployment options in the future, check the `unused-deployment-methods/` folder which contains:

- **AWS ECS/Fargate**: Complex container orchestration for larger scale
- **Railway**: Simple $5/month deployment platform
- **Various Scripts**: Alternative deployment and cleanup scripts

These were evaluated but not implemented due to being overkill for the current scale or having other trade-offs.

## Support

For issues:
1. Check CloudWatch logs (if configured)
2. SSH into instance and check Docker logs
3. Verify environment variables
4. Test components individually
5. Review security group settings
