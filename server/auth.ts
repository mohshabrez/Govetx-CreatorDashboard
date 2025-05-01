import { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@shared/schema";
import { storage } from "./storage";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

type DecodedToken = {
  id: string;
  username: string;
  email: string;
  role: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_development";

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
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
}

export function setupAuth(app: Express) {
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Grant initial credits for registration
      await storage.addCredits({
        userId: (user._id as mongoose.Types.ObjectId).toString(),
        amount: 100,
        reason: "Welcome bonus",
      });

      const token = generateToken(user);
      res.status(201).json({ 
        token,
        user: {
          id: (user._id as mongoose.Types.ObjectId).toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      console.log('Login attempt - Request body:', {
        username: req.body.username,
        hasPassword: !!req.body.password
      });
      
      const user = await storage.getUserByUsername(req.body.username);
      console.log('Database query result:', {
        userFound: !!user,
        userId: user?._id?.toString(),
        username: user?.username,
        hashedPasswordLength: user?.password?.length
      });
      
      if (!user) {
        console.log('Login failed: User not found');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await comparePasswords(req.body.password, user.password);
      console.log('Password verification:', {
        suppliedPasswordLength: req.body.password?.length,
        storedPasswordLength: user.password?.length,
        matches: passwordMatch
      });
      
      if (!passwordMatch) {
        console.log('Login failed: Password does not match');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login time
      const now = new Date();
      const updateResult = await storage.updateUser(
        (user._id as mongoose.Types.ObjectId).toString(), 
        { lastLoginAt: now }
      );
      console.log('Last login time update:', {
        success: !!updateResult,
        timestamp: now
      });
      
      // Add daily login credit if it's the user's first login of the day
      const lastLogin = user.lastLoginAt;
      const isNewDay = !lastLogin || 
        (now.getDate() !== lastLogin.getDate() || 
         now.getMonth() !== lastLogin.getMonth() || 
         now.getFullYear() !== lastLogin.getFullYear());
      
      if (isNewDay) {
        const creditResult = await storage.addCredits({
          userId: (user._id as mongoose.Types.ObjectId).toString(),
          amount: 50,
          reason: "Daily login bonus",
        });
        console.log('Daily login bonus added:', {
          success: !!creditResult,
          amount: 50
        });
      }

      const token = generateToken(user);
      console.log('Login successful:', {
        userId: user._id.toString(),
        tokenGenerated: !!token
      });
      
      res.status(200).json({ 
        token,
        user: {
          id: (user._id as mongoose.Types.ObjectId).toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  });

  app.get("/api/user", authenticateToken, (req, res) => {
    res.json(req.user);
  });
}
