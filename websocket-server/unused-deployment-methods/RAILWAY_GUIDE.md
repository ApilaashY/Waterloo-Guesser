# Railway Deployment Guide - Simple WebSocket Hosting

Deploy your WebSocket server to Railway in under 10 minutes for $5/month.

## 🚀 Why Railway?

Perfect for your 40-200 user scale:
- **Simple**: Git push to deploy (like Vercel)
- **Cheap**: $5/month with usage credits included  
- **WebSocket Ready**: Built-in support, no config needed
- **Scalable**: Handles 1000+ users when you grow
- **Reliable**: 99.9% uptime, automatic SSL

## 📋 Prerequisites

- GitHub account
- Your websocket-server code ready
- Railway account (free to create)

## 🛠️ Step 1: Prepare Your Code

Your code is already ready! Just verify your `package.json`:

```json
{
  "name": "waterloo-guesser-websocket",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.8.1",
    "mongodb": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

## 🚀 Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd websocket-server
   git init
   git add .
   git commit -m "Initial WebSocket server"
   git branch -M main
   git remote add origin https://github.com/your-username/waterloo-guesser-websocket.git
   git push -u origin main
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your websocket repo
   - Click "Deploy"

### Option B: Railway CLI (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## ⚙️ Step 3: Configure Environment Variables

In Railway dashboard:

1. Go to your project → Variables tab
2. Add these variables:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=waterloo_guesser
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

**Important**: Replace with your actual:
- MongoDB connection string
- Vercel app domain

## 🌐 Step 4: Get Your WebSocket URL

After deployment:
1. Railway provides a URL like: `https://your-app-name.railway.app`
2. Test it: `https://your-app-name.railway.app/health`
3. Should return: `{"status":"healthy",...}`

## 🔧 Step 5: Update Frontend

In Vercel environment variables:
```env
NEXT_PUBLIC_WEBSOCKET_URL=https://your-app-name.railway.app
```

Then redeploy your Vercel app.

## ✅ Step 6: Test Everything

1. **Health Check**
   ```bash
   curl https://your-app-name.railway.app/health
   ```

2. **WebSocket Test**  
   - Open your app at your Vercel URL
   - Go to versus mode
   - Test multiplayer functionality

3. **Load Test** (Optional)
   ```javascript
   // Test in browser console
   for (let i = 0; i < 50; i++) {
       const socket = io('https://your-app-name.railway.app');
       socket.on('connect', () => console.log(`User ${i} connected`));
   }
   ```

## 📊 Monitoring

Railway provides built-in monitoring:

1. **Logs**: Real-time application logs
2. **Metrics**: CPU, Memory, Network usage  
3. **Uptime**: Service availability tracking
4. **Alerts**: Email notifications for issues

Access via Railway dashboard → Your Project → Observability

## 💰 Cost Breakdown

**Railway Hobby Plan: $5/month**
- Includes $5 usage credits
- After credits: pay for actual usage
- Typical cost for your scale: $5-8/month total

**Usage-based pricing:**
- CPU: $0.00000772 per vCPU/second
- Memory: $0.00000386 per GB/second  
- Network: $0.05 per GB egress

**For 200 concurrent users:** ~$5-6/month total

## 🔄 Deployment Updates

**Automatic deployments:**
```bash
# Just push to GitHub
git add .
git commit -m "Update websocket server"  
git push
# Railway automatically redeploys!
```

**Manual deployments:**
```bash
railway up
```

## 🆙 Scaling Options

**When you grow beyond 500 users:**

1. **Railway Pro** ($20/month with $20 credits)
   - Better performance
   - Priority support
   - Advanced features

2. **Horizontal scaling**
   - Enable replicas in Railway dashboard
   - Automatic load balancing

3. **Consider AWS ECS** (only at 1000+ users)

## 🛠️ Custom Domain (Optional)

1. Add custom domain in Railway dashboard
2. Point DNS to Railway
3. Automatic SSL certificate

Example: `wss://websocket.yourdomain.com`

## 🔧 Troubleshooting

### Common Issues

**1. Build Failed**
- Check `package.json` has correct `start` script
- Verify all dependencies listed

**2. CORS Errors**  
- Add your Vercel domain to `ALLOWED_ORIGINS`
- Include both `http://localhost:3000` and production domain

**3. MongoDB Connection Failed**
- Verify connection string in Railway variables
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)

**4. WebSocket Connection Issues**
- Test health endpoint first
- Check browser console for errors
- Verify `NEXT_PUBLIC_WEBSOCKET_URL` in Vercel

### Debug Commands

```bash
# View logs
railway logs

# Check environment
railway variables

# Shell access
railway shell
```

## 📋 Migration Checklist

If switching from AWS ECS:

- [ ] Deploy to Railway
- [ ] Test WebSocket functionality  
- [ ] Update Vercel environment variable
- [ ] Test full multiplayer flow
- [ ] Monitor for 24 hours
- [ ] Cleanup AWS resources (run cleanup script)

## 🎉 Success!

Your WebSocket server is now running on Railway:
- ✅ $5/month cost (vs $33-49 on AWS)
- ✅ Simple git-based deployments
- ✅ Built-in monitoring and SSL
- ✅ Ready to scale when you grow
- ✅ No infrastructure complexity

Your multiplayer Waterloo Guesser game is ready for players! 🎮🚀

---

**Need help?** 
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Test your deployment: Use the `test.html` file in your websocket-server folder
