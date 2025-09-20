# 🎯 Waterloo Guesser - AWS WebSocket Server Deployment

Complete guide for deploying your multiplayer WebSocket server to AWS ECS Fargate.

## 📋 Overview

This deployment separates your application into two parts:
- **Frontend (Next.js)** → Vercel (handles web pages, API routes)
- **WebSocket Server** → AWS ECS Fargate (handles real-time multiplayer)

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel App    │────│  AWS ALB + ECS   │────│   MongoDB       │
│   (Frontend)    │    │  (WebSocket)     │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Prerequisites
- **AWS CLI**: [Installation Guide](./PREREQUISITES.md)
- **Docker Desktop**: [Installation Guide](./PREREQUISITES.md)
- **MongoDB**: [Setup Guide](./PREREQUISITES.md)

### 2. Deploy WebSocket Server
```powershell
cd websocket-server
.\deploy.ps1 -MongoDBURI "your_connection_string" -MongoDBDB "your_db_name"
```

### 3. Update Frontend
Add to Vercel environment variables:
```
NEXT_PUBLIC_WEBSOCKET_URL=http://your-alb-dns-name
```

### 4. Test Everything
Open your app and test multiplayer functionality!

## 📁 Repository Structure

```
websocket-server/
├── server.js                 # Main WebSocket server
├── package.json              # Dependencies
├── Dockerfile                # Container configuration
├── deploy.ps1                # AWS deployment script
├── cleanup.ps1               # Resource cleanup script
├── test.html                 # WebSocket testing tool
├── .env.example              # Environment template
├── aws/
│   ├── 01-vpc.yml            # VPC infrastructure
│   └── 02-ecs-fargate.yml    # ECS infrastructure
├── handlers/                 # Game logic handlers
├── types/                    # Type definitions
└── lib/                      # MongoDB connection
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PREREQUISITES.md](./PREREQUISITES.md) | Install AWS CLI, Docker, MongoDB |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist |
| [README.md](./README.md) | Detailed deployment guide |
| [TESTING.md](./TESTING.md) | Testing procedures |
| [FRONTEND_SETUP.md](../FRONTEND_SETUP.md) | Frontend configuration |

## 💰 Cost Estimation

### AWS Monthly Costs
- **ECS Fargate (2 tasks)**: ~$15-25
- **Application Load Balancer**: ~$16
- **Data Transfer**: ~$1-5
- **CloudWatch Logs**: ~$1-3
- **Total**: ~$33-49/month

### MongoDB Atlas
- **Free Tier**: $0 (good for development)
- **M10 Production**: ~$57/month

## 🔧 Configuration

### Environment Variables

**WebSocket Server (.env)**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=waterloo_guesser
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

**Frontend (Vercel Environment Variables)**
```env
NEXT_PUBLIC_WEBSOCKET_URL=http://your-alb-dns-name
```

## 🎮 Features

### Real-time Multiplayer
- ✅ Queue-based matchmaking
- ✅ Synchronized game rounds
- ✅ Live point updates
- ✅ Persistent connections with sticky sessions

### AWS Infrastructure
- ✅ Auto-scaling ECS Fargate service
- ✅ Application Load Balancer with WebSocket support
- ✅ Health checks and monitoring
- ✅ Container registry (ECR)

### Production Ready
- ✅ Docker containerization
- ✅ Infrastructure as Code (CloudFormation)
- ✅ Automated deployment scripts
- ✅ Monitoring and logging

## 🔄 Deployment Workflow

1. **Local Development**
   ```powershell
   cd websocket-server
   .\dev.ps1  # Start local server
   ```

2. **Test Locally**
   - Open `test.html` in browser
   - Test WebSocket connections
   - Verify game functionality

3. **Deploy to AWS**
   ```powershell
   .\deploy.ps1 -MongoDBURI "connection_string" -MongoDBDB "db_name"
   ```

4. **Update Frontend**
   - Add WebSocket URL to Vercel environment
   - Redeploy frontend

5. **Production Testing**
   - Test multiplayer functionality
   - Monitor performance
   - Verify scaling

## 🛠️ Management Commands

### Deployment
```powershell
# Initial deployment
.\deploy.ps1

# Update with new code
.\deploy.ps1  # Builds new image and updates service

# Force new deployment
aws ecs update-service --cluster waterloo-guesser-ws-cluster --service waterloo-guesser-ws-service --force-new-deployment
```

### Monitoring
```bash
# View live logs
aws logs tail /ecs/waterloo-guesser-ws-websocket-server --follow

# Check service status
aws ecs describe-services --cluster waterloo-guesser-ws-cluster --services waterloo-guesser-ws-service
```

### Cleanup
```powershell
# Remove all AWS resources
.\cleanup.ps1
```

## 🔍 Troubleshooting

### Common Issues

1. **AWS CLI not configured**
   ```bash
   aws configure
   ```

2. **Docker not running**
   - Start Docker Desktop

3. **MongoDB connection failed**
   - Check connection string
   - Verify IP whitelist

4. **WebSocket connection issues**
   - Check CORS configuration
   - Verify ALB health checks

### Debug Commands
```bash
# Test health endpoint
curl http://your-alb-dns-name/health

# Check ECS task logs
aws logs tail /ecs/waterloo-guesser-ws-websocket-server --follow

# List running tasks
aws ecs list-tasks --cluster waterloo-guesser-ws-cluster
```

## 📈 Scaling

### Manual Scaling
Update `DesiredCount` in `deploy.ps1` and redeploy:
```powershell
# Edit deploy.ps1 - change DesiredCount=4
.\deploy.ps1
```

### Auto Scaling
The infrastructure includes auto-scaling policies that will:
- Scale up when CPU > 70%
- Scale down when CPU < 30%
- Maintain 2-10 tasks

## 🔐 Security

### Best Practices Implemented
- ✅ Non-root container user
- ✅ Minimal Docker image
- ✅ VPC with security groups
- ✅ Environment variable management
- ✅ Health checks and monitoring

### Additional Security (Optional)
- 🔄 Add SSL certificate for HTTPS
- 🔄 Custom domain with Route 53
- 🔄 WAF for DDoS protection
- 🔄 VPC endpoints for private communication

## 📞 Support

### Getting Help
1. Check the [TESTING.md](./TESTING.md) guide
2. Review CloudWatch logs
3. Verify configuration in [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. Test components individually

### Useful Resources
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## 🎉 Success!

Once deployed, your WebSocket server will be running on AWS with:
- ⚡ Auto-scaling capabilities
- 🔄 Zero-downtime deployments
- 📊 Built-in monitoring
- 💰 Cost-effective infrastructure

Your multiplayer Waterloo Guesser game is now ready for production! 🚀
