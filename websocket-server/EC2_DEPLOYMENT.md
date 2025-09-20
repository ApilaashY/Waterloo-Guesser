# Simple AWS EC2 WebSocket Deployment

Deploy your WebSocket server to a single AWS EC2 instance - much simpler than ECS but still on AWS.

## 🎯 Why EC2 Instead of ECS?

**Perfect for your 40-200 user scale:**
- **Much simpler**: Single server, no load balancers
- **Cheaper**: ~$10-15/month vs $33-49/month with ECS
- **Still scalable**: Can handle 1000+ users easily
- **AWS ecosystem**: Stays within AWS but without complexity
- **Full control**: SSH access, direct server management

## 💰 Cost Comparison

| Option | Monthly Cost | Complexity | Can Handle |
|--------|-------------|------------|------------|
| **Railway** | $5 | ⭐⭐⭐⭐⭐ | 1000+ users |
| **EC2 Instance** | $10-15 | ⭐⭐⭐ | 2000+ users |
| **ECS (Current)** | $33-49 | ⭐ | 10,000+ users |

## 📋 Prerequisites

- [ ] AWS CLI installed and configured
- [ ] AWS account with EC2 permissions
- [ ] MongoDB Atlas setup
- [ ] Your websocket-server code ready

## 🚀 Deployment Steps

### Step 1: Create EC2 Instance

1. **Go to AWS EC2 Console**
   - Search "EC2" in AWS Console
   - Click "Launch Instance"

2. **Configure Instance**
   ```
   Name: waterloo-guesser-websocket
   AMI: Amazon Linux 2023 (Free tier eligible)
   Instance type: t3.micro (or t3.small for better performance)
   Key pair: Create new or use existing
   Security Group: Create new with these rules:
   ```

3. **Security Group Rules**
   ```
   Type: SSH, Port: 22, Source: My IP (for admin access)
   Type: HTTP, Port: 80, Source: 0.0.0.0/0 (for health checks)
   Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0 (for WebSocket)
   Type: HTTPS, Port: 443, Source: 0.0.0.0/0 (for SSL - optional)
   ```

4. **Storage**: 8GB (default) is fine

### Step 2: Connect and Setup Server

1. **Connect via SSH**
   ```bash
   ssh -i "your-key.pem" ec2-user@your-instance-public-ip
   ```

2. **Install Docker**
   ```bash
   # Update system
   sudo yum update -y
   
   # Install Docker
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker ec2-user
   
   # Logout and login again for group changes
   exit
   ssh -i "your-key.pem" ec2-user@your-instance-public-ip
   ```

3. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

### Step 3: Deploy Your Application

1. **Create application directory**
   ```bash
   mkdir -p ~/waterloo-guesser-ws
   cd ~/waterloo-guesser-ws
   ```

2. **Upload your code** (Choose one method)

   **Option A: Using SCP**
   ```bash
   # From your local machine
   scp -i "your-key.pem" -r websocket-server/* ec2-user@your-instance-ip:~/waterloo-guesser-ws/
   ```

   **Option B: Using Git**
   ```bash
   # On EC2 instance
   sudo yum install -y git
   git clone https://github.com/your-username/waterloo-guesser-websocket.git
   cd waterloo-guesser-websocket
   ```

3. **Create environment file**
   ```bash
   cat > .env << EOF
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB=waterloo_guesser
   ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   EOF
   ```

4. **Create docker-compose.yml**
   ```bash
   cat > docker-compose.yml << EOF
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
   EOF
   ```

### Step 4: Build and Run

```bash
# Build and start the application
docker-compose up -d

# Check if it's running
docker-compose ps
docker-compose logs -f websocket-server
```

### Step 5: Test Your Deployment

1. **Health Check**
   ```bash
   curl http://your-instance-public-ip/health
   ```

2. **WebSocket Test**
   - Update your frontend: `NEXT_PUBLIC_WEBSOCKET_URL=http://your-instance-public-ip`
   - Test multiplayer functionality

## 🔧 Management Commands

### Start/Stop Service
```bash
cd ~/waterloo-guesser-ws

# Stop
docker-compose down

# Start
docker-compose up -d

# Restart
docker-compose restart

# View logs
docker-compose logs -f websocket-server
```

### Update Application
```bash
# Pull new code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Monitor Resources
```bash
# Check system resources
htop
df -h
free -h

# Check Docker stats
docker stats
```

## 🔒 Security Hardening (Optional but Recommended)

### 1. Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo yum install -y certbot

# Get SSL certificate (requires domain name)
sudo certbot certonly --standalone -d your-websocket-domain.com

# Update docker-compose.yml to use SSL
```

### 2. Firewall Configuration
```bash
# Install and configure firewall
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow only necessary ports
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## 📊 Monitoring Setup

### 1. CloudWatch Agent (Optional)
```bash
# Install CloudWatch agent for monitoring
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### 2. Simple Monitoring Script
```bash
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
while true; do
    echo "$(date): Health check"
    curl -f http://localhost:3001/health || echo "Health check failed!"
    sleep 60
done
EOF

chmod +x ~/monitor.sh
nohup ~/monitor.sh > monitor.log 2>&1 &
```

## 🔄 Auto-Start on Boot

```bash
# Create systemd service
sudo cat > /etc/systemd/system/waterloo-guesser-ws.service << 'EOF'
[Unit]
Description=Waterloo Guesser WebSocket Server
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/waterloo-guesser-ws
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable waterloo-guesser-ws.service
sudo systemctl start waterloo-guesser-ws.service
```

## 🆙 Scaling Options

### Vertical Scaling (More Power)
1. Stop instance
2. Change instance type (t3.small → t3.medium)
3. Start instance
4. No data loss, minimal downtime

### Horizontal Scaling (When You Grow)
1. Create Application Load Balancer
2. Launch multiple EC2 instances
3. Use shared database (MongoDB Atlas)
4. Distribute traffic across instances

## 🛠️ Troubleshooting

### Application Won't Start
```bash
# Check Docker logs
docker-compose logs websocket-server

# Check if MongoDB is reachable
docker-compose exec websocket-server node -e "
const { MongoClient } = require('mongodb');
MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error);
"
```

### Can't Connect from Frontend
```bash
# Check if port is open
sudo netstat -tlnp | grep 3001

# Check security group allows port 3001
# Check instance firewall (if configured)

# Test locally on server
curl http://localhost:3001/health
```

### High CPU/Memory Usage
```bash
# Check resource usage
docker stats

# Scale up instance type
# Or optimize application code
```

## 💰 Cost Optimization

### Instance Sizing for Your Scale
- **t3.micro**: $8.5/month - Good for 50 users
- **t3.small**: $17/month - Good for 200 users  
- **t3.medium**: $34/month - Good for 500+ users

### Reserved Instances (Save 30-60%)
- Commit to 1-3 years
- Significant savings for steady workloads

## 🧹 Cleanup

To remove everything:
1. Terminate EC2 instance in AWS console
2. Delete security group (if custom)
3. Release Elastic IP (if used)

## 📋 Management Checklist

### Daily
- [ ] Check application logs: `docker-compose logs --tail=100 websocket-server`
- [ ] Monitor health endpoint: `curl http://your-ip/health`

### Weekly  
- [ ] Check system updates: `sudo yum update`
- [ ] Monitor disk space: `df -h`
- [ ] Review CloudWatch metrics (if configured)

### Monthly
- [ ] Review AWS costs
- [ ] Update dependencies
- [ ] Security patches

---

## 🎉 Success!

Your WebSocket server is now running on EC2:
- ✅ Simple single-server deployment
- ✅ Much cheaper than ECS setup
- ✅ Can handle 1000+ users
- ✅ Full control and SSH access
- ✅ Easy to monitor and manage

**WebSocket URL**: `http://your-instance-public-ip:3001`
**Health Check**: `http://your-instance-public-ip/health`

Update your Vercel environment and start testing! 🚀
