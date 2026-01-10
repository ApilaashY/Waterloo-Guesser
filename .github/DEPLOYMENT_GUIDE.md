# CI/CD Setup Guide for WebSocket Server

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. EC2_SSH_KEY
- The private SSH key (.pem file) content for connecting to your EC2 instance
- Go to: Repository Settings → Secrets and variables → Actions → New repository secret
- Name: `EC2_SSH_KEY`
- Value: Paste the entire content of your `.pem` file

### 2. EC2_HOST  
- The public DNS or IP address of your EC2 instance
- Name: `EC2_HOST`
- Value: Your EC2 public DNS (e.g., `ec2-xx-xx-xx-xx.compute-1.amazonaws.com`)

## How to Add Secrets

1. **Navigate to your GitHub repository**
2. **Go to Settings tab**
3. **Click "Secrets and variables" → "Actions"**  
4. **Click "New repository secret"**
5. **Add each secret:**

```
Name: EC2_SSH_KEY
Value: [Paste your .pem file content]

Name: EC2_HOST  
Value: [Your EC2 public DNS/IP]
```

## How the Pipeline Works

### Triggers
- **Automatic**: Runs when you push changes to the `websocket-server/` folder on main branch
- **Manual**: You can trigger it manually from GitHub Actions tab

### Steps
1. **Build & Test**: Validates the websocket-server code
2. **SSH Setup**: Configures connection to your EC2 instance
3. **Deploy**: 
   - Pulls latest code on EC2
   - Installs dependencies
   - Restarts Docker containers
   - Runs health checks
4. **Verify**: Checks if deployment was successful

### Deployment Process on EC2
```bash
# The pipeline runs these commands on your EC2:
cd waterloo-guesser-ws
git pull origin main
cd websocket-server && npm ci
docker-compose -f deployment-docker-compose.yml down
docker-compose -f deployment-docker-compose.yml up -d
curl -f https://ws.uwguesser.com/health  # Health check
```

## Testing the Pipeline

### 1. Make a test change
```bash
# Edit a file in websocket-server/
echo "// Test change" >> websocket-server/server.js
git add websocket-server/
git commit -m "test: trigger deployment pipeline"
git push origin main
```

### 2. Watch the deployment
- Go to GitHub → Actions tab
- Watch the "Deploy WebSocket Server to EC2" workflow run
- Check the logs for any errors

### 3. Verify deployment
- Check: `https://ws.uwguesser.com/health`
- Should return: `{"status":"healthy","timestamp":"...","uptime":...}`

## Rollback Process

If deployment fails, you can quickly rollback:

```bash
# SSH into your EC2 instance
ssh -i "your-key.pem" ec2-user@your-ec2-host

# Rollback to previous commit
cd waterloo-guesser-ws
git log --oneline -5  # See recent commits
git checkout <previous-commit-hash>

# Restart containers
docker-compose -f deployment-docker-compose.yml down
docker-compose -f deployment-docker-compose.yml up -d
```

## Security Notes

- ✅ SSH keys are stored as encrypted GitHub secrets
- ✅ Pipeline only deploys on main branch
- ✅ Health checks verify successful deployment
- ✅ Full deployment logs for debugging
- ⚠️  Make sure your EC2 security group allows SSH (port 22) from GitHub's IP ranges

## Monitoring

After deployment, monitor:
- **Health endpoint**: `https://ws.uwguesser.com/health`
- **Container logs**: `docker-compose -f deployment-docker-compose.yml logs -f`
- **Server status**: `docker-compose -f deployment-docker-compose.yml ps`

## Next Steps

1. **Add the required secrets** (EC2_SSH_KEY, EC2_HOST)
2. **Test with a small change** to websocket-server/
3. **Monitor the first deployment** in GitHub Actions
4. **Set up notifications** (optional) for deployment status
