import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { SocialFeedService } from "./services/socialFeed";
import { insertSavedContentSchema, insertReportedContentSchema, insertCreditsSchema } from "@shared/schema";
import { ZodError } from "zod";
import { verifyToken } from "./auth";
import { Credit } from "./models/credit";
import { User } from "./models/user";

// Create separate router for feed endpoints
const feedRouter = Router();

// Reddit feed endpoint - no authentication required
feedRouter.get("/feed/reddit", async (req, res) => {
  console.log('Reddit feed endpoint hit');
  try {
    console.log('\n=== Reddit Feed Request Started ===');
    console.log('Request received:', {
      query: req.query,
      headers: req.headers
    });

    const { subreddit, query, limit } = req.query;
    
    const feedOptions = {
      subreddit: subreddit as string,
      query: query as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
    };

    console.log('Fetching Reddit feed with options:', feedOptions);

    // Verify SocialFeedService is properly initialized
    if (!SocialFeedService || typeof SocialFeedService.fetchRedditFeed !== 'function') {
      console.error('SocialFeedService is not properly initialized:', SocialFeedService);
      throw new Error('Feed service not properly initialized');
    }

    const feed = await SocialFeedService.fetchRedditFeed(feedOptions);
    
    console.log('Reddit feed fetched successfully:', {
      itemCount: feed.items.length
    });

    console.log('=== Reddit Feed Request Completed ===\n');
    res.json(feed);
  } catch (error) {
    console.error('=== Reddit Feed Request Error ===');
    console.error('Error in Reddit feed route:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('=== Reddit Feed Request Error End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to fetch Reddit feed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Twitter feed endpoint - no authentication required
feedRouter.get("/feed/twitter", async (req, res) => {
  console.log('Twitter feed endpoint hit');
  try {
    console.log('\n=== Twitter Feed Request Started ===');
    console.log('Request received:', {
      query: req.query,
      headers: req.headers
    });

    const { query, limit } = req.query;
    
    const feedOptions = {
      query: query as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
    };

    console.log('Fetching Twitter feed with options:', feedOptions);

    // Verify SocialFeedService is properly initialized
    if (!SocialFeedService || typeof SocialFeedService.fetchTwitterFeed !== 'function') {
      console.error('SocialFeedService is not properly initialized:', SocialFeedService);
      throw new Error('Feed service not properly initialized');
    }

    const feed = await SocialFeedService.fetchTwitterFeed(feedOptions);
    
    console.log('Twitter feed fetched successfully:', {
      itemCount: feed.items.length
    });

    console.log('=== Twitter Feed Request Completed ===\n');
    res.json(feed);
  } catch (error) {
    console.error('=== Twitter Feed Request Error ===');
    console.error('Error in Twitter feed route:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('=== Twitter Feed Request Error End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to fetch Twitter feed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Combined feed endpoint - no authentication required
feedRouter.get("/feed/combined", async (req, res) => {
  console.log('Combined feed endpoint hit');
  try {
    console.log('\n=== Combined Feed Request Started ===');
    console.log('Request received:', {
      query: req.query,
      headers: req.headers
    });

    const { subreddit, query, limit } = req.query;
    
    const feedOptions = {
      subreddit: subreddit as string,
      query: query as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
    };

    console.log('Fetching combined feed with options:', feedOptions);

    // Verify SocialFeedService is properly initialized
    if (!SocialFeedService || typeof SocialFeedService.fetchCombinedFeed !== 'function') {
      console.error('SocialFeedService is not properly initialized:', SocialFeedService);
      throw new Error('Feed service not properly initialized');
    }

    const feed = await SocialFeedService.fetchCombinedFeed(feedOptions);
    
    console.log('Combined feed fetched successfully');

    console.log('=== Combined Feed Request Completed ===\n');
    res.json(feed);
  } catch (error) {
    console.error('=== Combined Feed Request Error ===');
    console.error('Error in combined feed route:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('=== Combined Feed Request Error End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to fetch combined feed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

// Admin middleware
const isAdmin = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  req.user = decoded;
  next();
};

// Error handler for Zod validation errors
const handleZodError = (error: unknown) => {
  if (error instanceof ZodError) {
    const errors = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return { message: "Validation error", errors };
  }
  return { message: "An unexpected error occurred" };
};

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('\n=== Registering Routes ===');
  
  // Set up authentication routes
  setupAuth(app);
  console.log('✓ Auth routes registered');

  // Mount the feed router
  app.use('/api', feedRouter);
  console.log('✓ Feed router mounted');

  // Twitter feed endpoint - no authentication required
  app.get("/api/feed/twitter", async (req, res) => {
    console.log('Twitter feed endpoint hit');
    try {
      console.log('\n=== Twitter Feed Request Started ===');
      console.log('Request received:', {
        query: req.query,
        headers: req.headers
      });

      const { query, limit } = req.query;
      
      const feedOptions = {
        query: query as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      console.log('Fetching Twitter feed with options:', feedOptions);

      // Verify SocialFeedService is properly initialized
      if (!SocialFeedService || typeof SocialFeedService.fetchTwitterFeed !== 'function') {
        console.error('SocialFeedService is not properly initialized:', SocialFeedService);
        throw new Error('Feed service not properly initialized');
      }

      const feed = await SocialFeedService.fetchTwitterFeed(feedOptions);
      
      console.log('Twitter feed fetched successfully:', {
        itemCount: feed.items.length
      });

      console.log('=== Twitter Feed Request Completed ===\n');
      res.json(feed);
    } catch (error) {
      console.error('=== Twitter Feed Request Error ===');
      console.error('Error in Twitter feed route:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('=== Twitter Feed Request Error End ===\n');
      
      res.status(500).json({ 
        error: 'Failed to fetch Twitter feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  console.log('✓ Twitter feed route registered');

  // Combined feed endpoint - no authentication required
  app.get("/api/feed/combined", async (req, res) => {
    console.log('Combined feed endpoint hit');
    try {
      console.log('\n=== Combined Feed Request Started ===');
      console.log('Request received:', {
        query: req.query,
        headers: req.headers
      });

      const { subreddit, query, limit } = req.query;
      
      const feedOptions = {
        subreddit: subreddit as string,
        query: query as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      console.log('Fetching combined feed with options:', feedOptions);

      // Verify SocialFeedService is properly initialized
      if (!SocialFeedService || typeof SocialFeedService.fetchCombinedFeed !== 'function') {
        console.error('SocialFeedService is not properly initialized:', SocialFeedService);
        throw new Error('Feed service not properly initialized');
      }

      const feed = await SocialFeedService.fetchCombinedFeed(feedOptions);
      
      console.log('Combined feed fetched successfully');

      console.log('=== Combined Feed Request Completed ===\n');
      res.json(feed);
    } catch (error) {
      console.error('=== Combined Feed Request Error ===');
      console.error('Error in combined feed route:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('=== Combined Feed Request Error End ===\n');
      
      res.status(500).json({ 
        error: 'Failed to fetch combined feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  console.log('✓ Combined feed route registered');

  // Credits routes
  app.get("/api/credits", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const [credits, total] = await Promise.all([
        storage.getUserCredits(req.user.id),
        storage.getTotalCredits(req.user.id)
      ]);
      res.json({ credits, total });
    } catch (error) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ message: 'Error fetching credits' });
    }
  });

  app.post("/api/credits/add", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const data = insertCreditsSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const credit = await storage.addCredits(data);
      res.status(201).json(credit);
    } catch (error) {
      console.error("Error adding credits:", error);
      if (error instanceof ZodError) {
        return res.status(400).json(handleZodError(error));
      }
      res.status(500).json({ message: "Failed to add credits" });
    }
  });

  // Saved content routes
  app.get("/api/saved-content", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const savedContent = await storage.getSavedContent(req.user.id);
      res.json(savedContent);
    } catch (error) {
      console.error('Error fetching saved content:', error);
      res.status(500).json({ message: 'Error fetching saved content' });
    }
  });

  app.post("/api/saved-content", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const data = insertSavedContentSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const savedItem = await storage.saveContent(data);
      
      // Award credits for saving content
      await storage.addCredits({
        userId: req.user.id,
        amount: 10,
        reason: "Saved content",
      });
      
      res.status(201).json(savedItem);
    } catch (error) {
      console.error("Error saving content:", error);
      if (error instanceof ZodError) {
        return res.status(400).json(handleZodError(error));
      }
      res.status(500).json({ message: "Failed to save content" });
    }
  });

  app.delete("/api/saved-content/:id", isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteSavedContent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved content:", error);
      res.status(500).json({ message: "Failed to delete saved content" });
    }
  });

  // Reported content routes
  app.post("/api/report-content", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const data = insertReportedContentSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const report = await storage.reportContent(data);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error reporting content:", error);
      if (error instanceof ZodError) {
        return res.status(400).json(handleZodError(error));
      }
      res.status(500).json({ message: "Failed to report content" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/credits/all", isAdmin, async (req, res) => {
    try {
      const credits = await Credit.find()
        .populate('userId', 'username email role')
        .sort({ createdAt: -1 });
      
      const total = await Credit.countDocuments();
      
      res.json({
        transactions: credits,
        total
      });
    } catch (error) {
      console.error('Error fetching all credits:', error);
      res.status(500).json({ message: 'Error fetching credit history' });
    }
  });

  app.post("/api/admin/credits", isAdmin, async (req, res) => {
    try {
      const { userId, amount, reason } = req.body;
      
      // Validate input
      if (!userId || !amount || !reason) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Create new credit transaction
      const credit = await Credit.create({
        userId,
        amount,
        reason
      });

      // Populate user information
      await credit.populate('userId', 'username email role');

      res.status(201).json(credit);
    } catch (error) {
      console.error('Error adding credits:', error);
      res.status(500).json({ message: 'Error adding credits' });
    }
  });

  app.get("/api/admin/reported-content", isAdmin, async (req, res) => {
    try {
      const reportedContent = await storage.getReportedContent();
      res.json(reportedContent);
    } catch (error) {
      console.error("Error fetching reported content:", error);
      res.status(500).json({ message: "Failed to fetch reported content" });
    }
  });

  app.post("/api/admin/user-role", isAdmin, async (req, res) => {
    try {
      const { userId, role } = req.body;
      
      if (!userId || !role || !["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid user ID or role" });
      }
      
      const user = await storage.updateUser(userId, { role });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  console.log('=== Route Registration Complete ===\n');

  const httpServer = createServer(app);
  return httpServer;
}
