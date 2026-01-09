# SSH Deployment Guide

## Connect to EC2

```bash
ssh -i "path/to/your-key.pem" *find the key in the aws console its called Public DNS in the EC2 instance*
```

## Navigate to Project

```bash
cd waterloo-guesser-ws
```

## Edit Files

Use `vi` editor (nano not available):

```bash
vi filename.js
```

**Vi Commands:**
- Press `i` to enter INSERT mode (start editing)
- Press `Esc` to exit INSERT mode
- Type `:wq` to save and quit
- Type `:q!` to force quit without saving

## Deploy Changes

### Stop containers
```bash
docker-compose -f deployment-docker-compose.yml down
```

### Start containers
```bash
docker-compose -f deployment-docker-compose.yml up -d
```

### View logs
```bash
docker-compose -f deployment-docker-compose.yml logs -f
```

### Check status
```bash
docker-compose -f deployment-docker-compose.yml ps
```

## Important Notes

- **NGINX runs on port 80/443** - Don't expose port 80 from Docker
- **Docker container runs on port 3001** - NGINX proxies to this
- **Health check endpoint:** `https://ws.uwguesser.com/health`

## File Locations

- Code: `~/waterloo-guesser-ws/`
- Handlers: `~/waterloo-guesser-ws/handlers/GameManagement/`
- Docker compose: `~/waterloo-guesser-ws/deployment-docker-compose.yml`
