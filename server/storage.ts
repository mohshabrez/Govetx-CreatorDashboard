import { User, Credit, SavedContent, ReportedContent, InsertUser, InsertCredit, InsertSavedContent, InsertReportedContent } from "@shared/schema";
import { db } from "./db";
import mongoose from "mongoose";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
  listUsers(): Promise<User[]>;
  
  // Credit operations
  getUserCredits(userId: string): Promise<Credit[]>;
  getAllCredits(): Promise<Credit[]>;
  getTotalCredits(userId: string): Promise<number>;
  addCredits(credit: InsertCredit): Promise<Credit>;
  
  // Saved content operations
  getSavedContent(userId: string): Promise<SavedContent[]>;
  saveContent(content: InsertSavedContent): Promise<SavedContent>;
  deleteSavedContent(id: string): Promise<boolean>;
  
  // Reported content operations
  reportContent(report: InsertReportedContent): Promise<ReportedContent>;
  getReportedContent(): Promise<ReportedContent[]>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await User.findOne({ username });
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async listUsers(): Promise<User[]> {
    return await User.find();
  }

  // Credit operations
  async getUserCredits(userId: string): Promise<Credit[]> {
    console.log('Fetching credits for user:', userId);
    const credits = await Credit.find({ userId }).sort({ createdAt: -1 });
    console.log('Found credits:', credits);
    return credits;
  }

  async getAllCredits(): Promise<Credit[]> {
    try {
      console.log('Fetching all credits');
      const credits = await Credit.find()
        .populate({
          path: 'userId',
          select: 'username email role',
          model: 'User'
        })
        .sort({ createdAt: -1 });
      
      console.log('Found all credits:', credits);
      
      // Transform the data to match the expected format
      const transformedCredits = credits.map(credit => ({
        id: credit._id,
        userId: credit.userId._id,
        amount: credit.amount,
        reason: credit.reason,
        createdAt: credit.createdAt,
        user: {
          id: credit.userId._id,
          username: credit.userId.username,
          email: credit.userId.email,
          role: credit.userId.role
        }
      }));
      
      return transformedCredits;
    } catch (error) {
      console.error('Error fetching all credits:', error);
      throw error;
    }
  }

  async getTotalCredits(userId: string): Promise<number> {
    try {
      console.log('Calculating total credits for user:', userId);
      let userObjectId: mongoose.Types.ObjectId;
      try {
        userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('Converted userId to ObjectId:', userObjectId);
      } catch (error) {
        console.error('Invalid userId format:', error);
        return 0;
      }

      const result = await Credit.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      console.log('Aggregation result:', result);
      
      // If no credits exist, return 0
      if (!result || result.length === 0) {
        console.log('No credits found for user');
        return 0;
      }
      
      // Ensure we have a valid number
      const total = result[0]?.total;
      console.log('Calculated total credits:', total);
      return typeof total === 'number' ? total : 0;
    } catch (error) {
      console.error('Error calculating total credits:', error);
      return 0;
    }
  }

  async addCredits(creditData: InsertCredit): Promise<Credit> {
    try {
      console.log('Adding credits:', creditData);
      const credit = new Credit(creditData);
      await credit.save();
      console.log('Saved credit document:', credit);
      
      // After adding credits, verify the total
      const total = await this.getTotalCredits(creditData.userId);
      console.log(`Updated total credits for user ${creditData.userId}: ${total}`);
      
      return credit;
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  // Saved content operations
  async getSavedContent(userId: string): Promise<SavedContent[]> {
    return await SavedContent.find({ userId }).sort({ createdAt: -1 });
  }

  async saveContent(contentData: InsertSavedContent): Promise<SavedContent> {
    const savedItem = new SavedContent(contentData);
    await savedItem.save();
    return savedItem;
  }
  
  async deleteSavedContent(id: string): Promise<boolean> {
    const result = await SavedContent.findByIdAndDelete(id);
    return !!result;
  }

  // Reported content operations
  async reportContent(reportData: InsertReportedContent): Promise<ReportedContent> {
    const report = new ReportedContent(reportData);
    await report.save();
    return report;
  }
  
  async getReportedContent(): Promise<ReportedContent[]> {
    return await ReportedContent.find().sort({ createdAt: -1 });
  }
}

// Create and export a single instance of the storage
export const storage = new DatabaseStorage();
