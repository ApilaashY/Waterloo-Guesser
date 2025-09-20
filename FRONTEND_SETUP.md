# Frontend Configuration Guide

This guide explains how to configure your Next.js frontend to connect to the AWS WebSocket server.

## Environment Variables

### Local Development

1. Create `.env.local` file in your project root:
```bash
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

### Production Deployment (Vercel)

1. In your Vercel project dashboard, go to Settings → Environment Variables
2. Add the following variable:
   - **Key**: `NEXT_PUBLIC_WEBSOCKET_URL`
   - **Value**: `http://your-alb-dns-name` (you'll get this after AWS deployment)
   - **Environment**: Production

## Configuration Steps

### 1. After AWS Deployment

Once you deploy your WebSocket server to AWS, you'll get an ALB DNS name like:
```
waterloo-guesser-ws-alb-123456789.us-east-1.elb.amazonaws.com
```

### 2. Update Vercel Environment

Update your Vercel environment variable:
```
NEXT_PUBLIC_WEBSOCKET_URL=http://waterloo-guesser-ws-alb-123456789.us-east-1.elb.amazonaws.com
```

### 3. Redeploy Frontend

After updating the environment variable, redeploy your Vercel app:
```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## Testing the Connection

### 1. Check Frontend Connection

Open your browser's developer console and look for logs like:
```
[Socket] Connecting to WebSocket server: http://your-alb-dns-name
[Socket] Connected with ID: ABC123
```

### 2. Health Check

Test the WebSocket server directly:
```
http://your-alb-dns-name/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 3. WebSocket Test Tools

Use tools like:
- [WebSocket King](http://websocketking.com/)
- [Socket.IO Client Tool](https://socket.io/docs/v4/client-api/)

Connect to: `http://your-alb-dns-name`

## Environment Configuration Summary

| Environment | Variable | Value |
|-------------|----------|-------|
| Local Development | `NEXT_PUBLIC_WEBSOCKET_URL` | `http://localhost:3001` |
| Production (Vercel) | `NEXT_PUBLIC_WEBSOCKET_URL` | `http://your-alb-dns-name` |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Vercel domain is in the WebSocket server's CORS configuration
   - Check browser console for CORS error messages

2. **Connection Failed**
   - Verify the ALB DNS name is correct
   - Check that the WebSocket server is running (health check endpoint)
   - Ensure port 80 is accessible from your client

3. **Environment Variable Not Working**
   - Verify the variable name starts with `NEXT_PUBLIC_`
   - Redeploy after adding environment variables
   - Check that the variable appears in the browser (not server-side only)

### Debug Commands

```bash
# Check if environment variable is loaded
console.log(process.env.NEXT_PUBLIC_WEBSOCKET_URL)

# Test WebSocket connection manually
const socket = io('http://your-alb-dns-name');
socket.on('connect', () => console.log('Connected!'));
```

## Security Considerations

### HTTPS/SSL

For production, consider adding an SSL certificate to your ALB:
1. Request a certificate from AWS Certificate Manager
2. Add HTTPS listener to your ALB
3. Update frontend to use `https://` instead of `http://`

### Domain Setup

Instead of using the ALB DNS name directly, consider:
1. Setting up a custom domain (e.g., `ws.yourdomain.com`)
2. Creating a CNAME record pointing to the ALB
3. Using the custom domain in your frontend configuration

## Next Steps

1. Deploy your WebSocket server to AWS
2. Get the ALB DNS name from the deployment output
3. Update your Vercel environment variables
4. Redeploy your frontend
5. Test the multiplayer functionality
6. Consider adding SSL/custom domain for production
