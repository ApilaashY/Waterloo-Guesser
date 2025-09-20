# Prerequisites Installation Guide

You need to install AWS CLI and Docker before deploying your WebSocket server to AWS.

## 🔧 Installing AWS CLI

### Windows Installation

**Option 1: MSI Installer (Recommended)**
1. Download the AWS CLI MSI installer from: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the downloaded MSI file
3. Follow the installation wizard
4. Restart your PowerShell/Command Prompt

**Option 2: Using Chocolatey**
```powershell
# If you have Chocolatey installed
choco install awscli
```

**Option 3: Using winget**
```powershell
# If you have Windows Package Manager
winget install Amazon.AWSCLI
```

### Verify Installation
```powershell
aws --version
```
Should output something like: `aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64`

## 🐳 Installing Docker Desktop

### Windows Installation

1. **Download Docker Desktop**
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Download the installer

2. **Install Docker Desktop**
   - Run the installer
   - Follow the installation wizard
   - Enable WSL 2 integration when prompted
   - Restart your computer when installation completes

3. **Start Docker Desktop**
   - Launch Docker Desktop from Start Menu
   - Wait for it to start (may take a few minutes first time)
   - You'll see a green icon in the system tray when ready

### Verify Installation
```powershell
docker --version
```
Should output something like: `Docker version 24.x.x, build xxxxx`

```powershell
docker info
```
Should show Docker daemon information without errors.

## 🔑 Configure AWS CLI

After installing AWS CLI, you need to configure it with your AWS credentials.

### 1. Get AWS Credentials

**If you don't have an AWS account:**
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process

**If you have an AWS account:**
1. Sign in to AWS Console
2. Go to IAM (Identity and Access Management)
3. Click "Users" → "Add User"
4. Create a user with programmatic access
5. Attach policies: `PowerUserAccess` or specific ECS/EC2/CloudFormation permissions
6. Save the Access Key ID and Secret Access Key

### 2. Configure AWS CLI
```powershell
aws configure
```

Enter the following when prompted:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region name**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

### 3. Test Configuration
```powershell
aws sts get-caller-identity
```
Should return your AWS account information.

## 🗄️ Set Up MongoDB (Optional - if you don't have it)

### MongoDB Atlas (Recommended - Free Tier Available)

1. **Create Account**
   - Go to https://cloud.mongodb.com/
   - Sign up for free account

2. **Create Cluster**
   - Choose "Build a Database"
   - Select "Free" tier (M0 Sandbox)
   - Choose a cloud provider and region
   - Create cluster

3. **Configure Access**
   - Create database user (username/password)
   - Add IP address to whitelist (use `0.0.0.0/0` for all IPs or specific AWS ranges)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (format: `mongodb+srv://...`)

## ✅ Verification Checklist

Run these commands to verify everything is installed:

```powershell
# Check AWS CLI
aws --version

# Check Docker
docker --version
docker info

# Check AWS configuration
aws sts get-caller-identity

# Check if you can build images
docker run hello-world
```

## 🚀 Ready to Deploy!

Once all prerequisites are installed and configured:

1. **Navigate to websocket-server directory**
```powershell
cd websocket-server
```

2. **Run the deployment**
```powershell
.\deploy.ps1 -MongoDBURI "your_mongodb_connection_string" -MongoDBDB "your_database_name"
```

## 🆘 Troubleshooting

### AWS CLI Issues
- **Command not found**: Restart PowerShell after installation
- **Credentials error**: Run `aws configure` again
- **Permission denied**: Check IAM user permissions

### Docker Issues
- **Docker daemon not running**: Start Docker Desktop application
- **WSL 2 required**: Install WSL 2 from Microsoft Store
- **Virtualization error**: Enable virtualization in BIOS settings

### MongoDB Issues
- **Connection timeout**: Check IP whitelist settings
- **Authentication error**: Verify username/password
- **Database not found**: Ensure database name is correct

## 📞 Need Help?

- **AWS CLI Documentation**: https://docs.aws.amazon.com/cli/
- **Docker Documentation**: https://docs.docker.com/
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/

---

📝 **Note**: Installation may take 30-60 minutes depending on your internet connection and system. Take your time to get everything configured properly before proceeding with deployment.
