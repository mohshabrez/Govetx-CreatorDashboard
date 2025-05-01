# Setting Up CORS for Your API

After deploying your server to Render and client to Netlify, you'll need to ensure CORS is properly configured to allow communication between them.

Add the following code to your server's main file to allow requests from your Netlify site:

```javascript
import cors from 'cors';

// Use this for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
} else {
  // For production - replace with your actual Netlify URL
  app.use(cors({
    origin: 'https://your-netlify-app-name.netlify.app',
    credentials: true
  }));
}
```

Don't forget to update the production origin to match your actual Netlify domain after deployment.

You can also use the CORS_ORIGIN environment variable to make this configurable:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

And add CORS_ORIGIN to your Render environment variables. 