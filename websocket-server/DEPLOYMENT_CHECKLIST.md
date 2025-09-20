# Pre-Deployment Checklist

Choose your deployment method and complete the appropriate prerequisites.

## 🚀 Deployment Options

### Option 1: Simple EC2 Instance (Recommended)
**Cost: ~$10-15/month | Complexity: Medium | Can handle: 1000+ users**
- Single EC2 instance with Docker
- Much simpler than ECS, still on AWS
- Perfect for your 40-200 user scale

### Option 2: Full ECS Setup (Overkill for your scale)
**Cost: ~$33-49/month | Complexity: High | Can handle: 10,000+ users**
- Load balancer, auto-scaling, multiple instances
- Enterprise-grade but unnecessary for small scale

### Option 3: Railway (Simplest)
**Cost: ~$5/month | Complexity: Very Low | Can handle: 1000+ users**
- See `RAILWAY_GUIDE.md` for deployment
- Recommended if you want simplest option

---

## ✅ EC2 Deployment Prerequisites

### 1. AWS Setup
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] AWS account with EC2 permissions
- [ ] Chosen AWS region (default: us-east-1)

### 2. MongoDB Setup
- [ ] MongoDB database created (MongoDB Atlas recommended)
- [ ] Connection string ready (format: `mongodb+srv://username:password@cluster.mongodb.net/`)
- [ ] Database name decided
- [ ] Network access configured (whitelist 0.0.0.0/0 for AWS or specific IP ranges)

### 3. Project Setup
- [ ] All files in `websocket-server/` directory
- [ ] Package.json dependencies verified

## ✅ ECS Deployment Prerequisites (If you choose the complex option)

### 1. AWS Setup
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] AWS account with appropriate permissions (EC2, ECS, ECR, CloudFormation, IAM)
- [ ] Chosen AWS region (default: us-east-1)

### 2. Docker Setup
- [ ] Docker Desktop installed and running
- [ ] Can run `docker --version` successfully

### 3. MongoDB Setup
- [ ] MongoDB database created (MongoDB Atlas recommended)
- [ ] Connection string ready (format: `mongodb+srv://username:password@cluster.mongodb.net/`)
- [ ] Database name decided
- [ ] Network access configured (whitelist 0.0.0.0/0 for AWS or specific IP ranges)

### 4. Environment Configuration
- [ ] Updated `deploy.ps1` with your MongoDB connection string
- [ ] Updated `deploy.ps1` with your database name
- [ ] Updated `deploy.ps1` with your Vercel domain for CORS

### 5. Project Setup
- [ ] All files copied to `websocket-server/` directory
- [ ] Package.json dependencies verified
- [ ] .env.example reviewed

## 🚀 Deployment Commands

### EC2 Deployment (Recommended for your scale)
```powershell
cd websocket-server
.\deploy-ec2.ps1 -MongoDBURI "your_connection_string" -MongoDBDB "your_db_name" -AllowedOrigins "https://your-app.vercel.app"
```

### ECS Deployment (Overkill but available)
```powershell
cd websocket-server
.\deploy.ps1 -MongoDBURI "your_connection_string" -MongoDBDB "your_db_name" -AllowedOrigins "https://your-app.vercel.app"
```

## 📋 What Each Deployment Does

### EC2 Deployment
1. **Create EC2 Key Pair** (for SSH access)
2. **Create Security Group** (firewall rules)
3. **Launch EC2 Instance** (single server)
4. **Install Docker** (containerization)
5. **Deploy Application** (your WebSocket server)
6. **Provide endpoint URL** (for frontend configuration)

### ECS Deployment
1. **Validate prerequisites** (AWS CLI, Docker)
2. **Deploy VPC infrastructure** (subnets, security groups)
3. **Deploy ECS infrastructure** (cluster, service, load balancer)
4. **Create ECR repository** (Docker registry)
5. **Build Docker image** (from your WebSocket server code)
6. **Push to ECR** (container registry)
7. **Update ECS service** (deploy your application)
8. **Provide endpoint URL** (for frontend configuration)

## 🕐 Expected Timeline

### EC2 Deployment
- **Instance launch**: 2-3 minutes
- **Software installation**: 2-3 minutes
- **Application deployment**: 2-5 minutes

**Total time**: 6-11 minutes

### ECS Deployment
- **VPC deployment**: 2-3 minutes
- **ECS infrastructure**: 5-8 minutes
- **Docker build & push**: 3-5 minutes
- **Service deployment**: 5-10 minutes

**Total time**: 15-25 minutes

## 📊 Cost Estimation

### EC2 Deployment
- **t3.small instance**: ~$17/month
- **t3.micro instance**: ~$8.5/month (may be limited for high load)
- **Data transfer**: ~$1-3/month
- **Total**: ~$10-20/month

### ECS Deployment
- **Monthly cost**: ~$33-49/month
- **Hourly cost**: ~$0.045-0.068/hour
- **First deployment**: May take longer due to image downloads

## 🔧 After Deployment

### EC2 Deployment Output
```
🎉 Deployment completed!
Instance ID: i-1234567890abcdef0
Public IP: 54.123.456.789
WebSocket Endpoint: http://54.123.456.789:3001
Health Check: http://54.123.456.789/health
SSH Access: ssh -i waterloo-guesser-ws-key.pem ec2-user@54.123.456.789
```

### ECS Deployment Output
```
🎉 Deployment completed successfully!
WebSocket Endpoint: http://waterloo-guesser-ws-alb-123456789.us-east-1.elb.amazonaws.com
```

## 🆘 Troubleshooting

### Common Issues

1. **AWS credentials not configured**
   ```bash
   aws configure
   ```

2. **Docker not running**
   - Start Docker Desktop
   - Verify with `docker info`

3. **MongoDB connection issues**
   - Check connection string format
   - Verify network access settings
   - Test connection locally first

4. **CloudFormation stack errors**
   - Check AWS CloudFormation console for detailed errors
   - Verify region settings
   - Check AWS service limits

### Getting Help

1. **Check CloudFormation console**: See detailed error messages
2. **View deployment logs**: Script outputs detailed information
3. **Test components individually**: Use health check endpoints
4. **AWS CLI debugging**: Add `--debug` flag to AWS commands

## 🧹 Cleanup

### EC2 Cleanup
```powershell
.\cleanup-ec2.ps1
```

### ECS Cleanup
```powershell
.\cleanup.ps1
```

This will delete all AWS resources and stop billing.

---

✅ **Ready to deploy?** 
- For **40-200 users**: Use EC2 deployment (recommended)
- For **enterprise scale**: Use ECS deployment 
- For **simplest option**: Consider Railway (see `RAILWAY_GUIDE.md`)

Make sure all checkboxes above are checked, then run the deployment command!
