# Unused Deployment Methods

This folder contains alternative deployment methods and configurations that are not currently being used in production.

## Contents

### AWS ECS/Fargate (aws/)
- `01-vpc.yml` - CloudFormation template for VPC setup
- `02-ecs-fargate.yml` - CloudFormation template for ECS Fargate deployment
- Complex container orchestration setup that was deemed overkill for the current scale (40-200 users)

### Railway Deployment
- `RAILWAY_GUIDE.md` - Guide for deploying to Railway platform ($5/month alternative)

### Alternative EC2 Scripts
- `deploy-ec2.ps1` - Original EC2 deployment script (with Unicode issues)
- `deploy-ec2-simple.ps1` - Simplified EC2 deployment script
- These were iterations before the final `deploy-ec2-clean.ps1` version

### Generic Deployment Scripts
- `deploy.ps1` - Generic PowerShell deployment script for ECS/Fargate
- `deploy.sh` - Bash deployment script for ECS/Fargate (Linux/Mac)
- `cleanup.ps1` - Generic cleanup script for ECS resources

### Documentation
- `README-MAIN.md` - Original comprehensive README file
- `SIMPLE_ALTERNATIVES.md` - Documentation of simple deployment alternatives
- `TESTING.md` - Testing procedures for various deployment methods

## Currently Active Deployment

The project currently uses **EC2 Simple Deployment**:
- `deploy-ec2-clean.ps1` - Clean EC2 deployment script without Unicode issues
- `cleanup-ec2.ps1` - EC2-specific cleanup script
- Direct EC2 instance with Docker containers at `http://98.88.78.67:3001`

## Cost Comparison

| Method | Monthly Cost | Complexity | Scale |
|--------|-------------|------------|-------|
| **EC2 Simple** ✅ | ~$17-21 | Low | 40-200 users |
| ECS Fargate | ~$33-49 | High | 200+ users |
| Railway | ~$5 | Very Low | 20-100 users |

## When to Use Alternatives

### ECS/Fargate (aws/ folder)
- **Use when**: 500+ concurrent users, need auto-scaling, require high availability
- **Benefits**: Auto-scaling, load balancing, managed infrastructure
- **Drawbacks**: Higher cost, complex setup

### Railway (RAILWAY_GUIDE.md)
- **Use when**: Simple deployment, low cost, minimal users
- **Benefits**: Very simple, $5/month, good for development
- **Drawbacks**: Less control, limited scaling

### Alternative EC2 Scripts
- **Use when**: Need modifications to current deployment
- **Benefits**: Reference implementations, different approaches
- **Drawbacks**: May have bugs or compatibility issues

## Note

These files are kept for reference and potential future use if deployment requirements change or alternative methods become necessary. The current EC2 simple deployment is optimal for the project's current scale and requirements.
