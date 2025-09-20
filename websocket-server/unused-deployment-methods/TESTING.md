# Testing Guide

This guide helps you test your WebSocket server both locally and after AWS deployment.

## 🧪 Local Testing

### 1. Prerequisites for Local Testing
```powershell
# Navigate to websocket-server directory
cd websocket-server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configure Local Environment
Edit `.env` file with your MongoDB connection:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=your_database_name
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Start Local Server
```powershell
# Using the development script
.\dev.ps1

# Or manually
npm start
```

### 4. Test Local Server

**A. Health Check Test**
Open browser to: http://localhost:3001/health
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

**B. WebSocket Connection Test**
Open `test.html` in your browser and:
1. Ensure URL is `http://localhost:3001`
2. Click "Test Health Check" - should show ✅
3. Click "Connect" - should show "Connected"
4. Click "Join Queue" - should log queue joined message

## 🚀 AWS Deployment Testing

### 1. Deploy to AWS
```powershell
# Make sure you have AWS CLI and Docker installed
.\deploy.ps1 -MongoDBURI "your_connection_string" -MongoDBDB "your_db_name"
```

### 2. Get Deployment Information
After deployment, note the WebSocket endpoint from the output:
```
WebSocket Endpoint: http://waterloo-guesser-ws-alb-123456789.us-east-1.elb.amazonaws.com
```

### 3. Test AWS Deployment

**A. Health Check Test**
```bash
curl http://your-alb-dns-name/health
```

**B. WebSocket Test**
1. Open `test.html` in browser
2. Change URL to your ALB DNS name
3. Test connection and functionality

### 4. Update Frontend
Add to Vercel environment variables:
```
NEXT_PUBLIC_WEBSOCKET_URL=http://your-alb-dns-name
```

## 🎮 End-to-End Game Testing

### 1. Local Development Testing
```powershell
# Terminal 1: Start WebSocket server
cd websocket-server
.\dev.ps1

# Terminal 2: Start Next.js app
cd ..
npm run dev
```

Open two browser windows:
1. http://localhost:3000/queue-game
2. http://localhost:3000/queue-game (incognito/different browser)

Test the multiplayer flow:
1. Both players join queue
2. Players get matched
3. Game starts with image
4. Players submit guesses
5. Round results shown
6. Multiple rounds played
7. Final winner determined

### 2. Production Testing
1. Deploy WebSocket server to AWS
2. Update Vercel environment variable
3. Redeploy frontend to Vercel
4. Test full multiplayer flow on production

## 📊 Monitoring and Debugging

### 1. CloudWatch Logs
```bash
# View live logs
aws logs tail /ecs/waterloo-guesser-ws-websocket-server --follow

# Get recent logs
aws logs describe-log-streams --log-group-name /ecs/waterloo-guesser-ws-websocket-server
```

### 2. ECS Service Monitoring
```bash
# Check service status
aws ecs describe-services --cluster waterloo-guesser-ws-cluster --services waterloo-guesser-ws-service

# Check task health
aws ecs list-tasks --cluster waterloo-guesser-ws-cluster --service-name waterloo-guesser-ws-service
```

### 3. Load Balancer Health
```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:region:account:targetgroup/waterloo-guesser-ws-tg/xyz
```

## 🔍 Common Issues and Solutions

### Local Testing Issues

**1. MongoDB Connection Failed**
```
Error: MongoServerError: Authentication failed
```
Solutions:
- Check username/password in connection string
- Verify database exists
- Check IP whitelist (add 0.0.0.0/0 for testing)

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::3001
```
Solutions:
- Change PORT in .env file
- Kill process using port: `netstat -ano | findstr :3001`

**3. Dependencies Missing**
```
Error: Cannot find module 'express'
```
Solution:
- Run `npm install` in websocket-server directory

### AWS Deployment Issues

**1. AWS CLI Not Configured**
```
Error: Unable to locate credentials
```
Solution:
- Run `aws configure`
- Add access key, secret key, region

**2. Docker Build Failed**
```
Error: Docker daemon not running
```
Solution:
- Start Docker Desktop
- Verify with `docker info`

**3. CloudFormation Stack Failed**
```
Error: Resource creation cancelled
```
Solutions:
- Check CloudFormation console for detailed errors
- Verify AWS service limits
- Check IAM permissions

### Production Issues

**1. CORS Errors**
```
Error: CORS policy blocked
```
Solution:
- Add your Vercel domain to ALLOWED_ORIGINS
- Redeploy with updated CORS settings

**2. WebSocket Connection Failed**
```
Error: WebSocket connection failed
```
Solutions:
- Check ALB health checks
- Verify security group rules
- Test health endpoint directly

**3. High Latency**
```
Slow response times
```
Solutions:
- Choose AWS region closer to users
- Scale up ECS service (increase desired count)
- Monitor CloudWatch metrics

## 📈 Performance Testing

### 1. Load Testing
Use tools like Artillery or Socket.IO Tester:
```bash
# Install Artillery
npm install -g artillery

# Create load test script
# artillery quick --count 10 --num 50 http://your-alb-dns-name
```

### 2. Connection Testing
```javascript
// Test multiple connections
for (let i = 0; i < 100; i++) {
    const socket = io('http://your-alb-dns-name');
    socket.on('connect', () => console.log(`Client ${i} connected`));
}
```

### 3. Metrics to Monitor
- **Connection count**: Active WebSocket connections
- **Response time**: Health check response times
- **Memory usage**: ECS task memory utilization
- **CPU usage**: ECS task CPU utilization
- **Error rate**: Failed connections/requests

## ✅ Test Checklist

### Pre-deployment Testing
- [ ] Local server starts without errors
- [ ] Health check endpoint responds
- [ ] MongoDB connection successful
- [ ] WebSocket connections work locally
- [ ] Queue system functions
- [ ] Game logic works end-to-end

### Post-deployment Testing
- [ ] AWS infrastructure deployed successfully
- [ ] Health check works on ALB endpoint
- [ ] WebSocket connections work through ALB
- [ ] Sticky sessions functioning (same player same server)
- [ ] Frontend connects to AWS WebSocket server
- [ ] Full multiplayer game flow works
- [ ] Monitoring and logging operational

### Production Readiness
- [ ] CORS configured for production domains
- [ ] Environment variables set in Vercel
- [ ] SSL certificate added (optional but recommended)
- [ ] Custom domain configured (optional)
- [ ] Backup and monitoring strategy in place
- [ ] Cost monitoring and alerts configured

---

🎉 **Success!** If all tests pass, your WebSocket server is ready for production use!
