import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Express } from 'express';
import { storage } from './storage';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

// Basic user model
const userModel = {
  async create(username: string, email: string, password: string, role: string = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return storage.createUser({
      username,
      email,
      password: hashedPassword,
      role
    });
  },
  
  async findByUsername(username: string) {
    return storage.getUserByUsername(username);
  }
};

// Auth routes setup
export function setupAuth(app: Express) {
  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await userModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      const user = await userModel.create(username, email, password);
      
      // Create token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });
  
  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await userModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Create token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  });
  
  // Get current user info
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json(decoded);
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });
  
  // Logout (client-side)
  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
  });
}

// Token verification function
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
} 