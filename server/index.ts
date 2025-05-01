import 'dotenv/config';

// Setup import resolution for production
if (process.env.NODE_ENV === 'production') {
  // Use dynamic import to avoid issues during build
  // @ts-ignore - Ignore TS error for runtime JS file
  import('./resolve-imports.js').then(({ patchImports }) => {
    patchImports();
    console.log('Import resolution patched for production');
  }).catch(err => {
    console.error('Error patching imports:', err);
  });
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import { setupAuth } from "./auth";
import cors from 'cors';

// Log environment for debugging
console.log('Environment:', {
  nodeEnv: process.env.NODE_ENV,
  mongoDbUri: process.env.MONGODB_URI?.split('@')[0] + '@[HIDDEN]', // Hide credentials
  port: process.env.PORT || 5000
});

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Development-friendly CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5000', 'http://127.0.0.1:5173']
    : process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-netlify-url.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
console.log('CORS configured with options:', corsOptions);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  // Log all incoming requests immediately
  console.log(`\n=== Incoming Request ===`);
  console.log({
    method: req.method,
    path: path,
    query: req.query,
    headers: req.headers,
    body: req.body
  });
  
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`\n=== Request Complete ===`);
    console.log({
      method: req.method,
      path: path,
      status: res.statusCode,
      duration: `${duration}ms`,
      response: capturedJsonResponse
    });
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Setup authentication
    setupAuth(app);
    
    // Register API routes BEFORE any middleware
    const server = await registerRoutes(app);

    // Setup Vite and handle non-API routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Error handling for API routes - AFTER routes but BEFORE 404
    app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('API Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // 404 handler for API routes - LAST
    app.use('/api', (req, res) => {
      console.error('404 Not Found:', req.method, req.url);
      res.status(404).json({ message: 'API endpoint not found' });
    });

    // Start the server
    const port = 5000;
    server.listen(port, 'localhost', () => {
      log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();
