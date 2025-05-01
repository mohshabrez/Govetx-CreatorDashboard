import mongoose from 'mongoose';
import { z } from "zod";

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: "user" },
  profileCompleted: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Credits Schema
const creditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Saved Content Schema
const savedContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: String, required: true },
  source: { type: String, required: true },
  content: { type: String, required: true },
  contentUrl: String,
  createdAt: { type: Date, default: Date.now }
});

// Reported Content Schema
const reportedContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: String, required: true },
  source: { type: String, required: true },
  reason: { type: String, required: true },
  additionalDetails: String,
  createdAt: { type: Date, default: Date.now }
});

// Create models - use conditional creation to prevent duplicate model registration
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Credit = mongoose.models.Credit || mongoose.model('Credit', creditSchema);
export const SavedContent = mongoose.models.SavedContent || mongoose.model('SavedContent', savedContentSchema);
export const ReportedContent = mongoose.models.ReportedContent || mongoose.model('ReportedContent', reportedContentSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertSavedContentSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  source: z.string(),
  content: z.string(),
  contentUrl: z.string().optional(),
});

export const insertReportedContentSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  source: z.string(),
  reason: z.string(),
  additionalDetails: z.string().optional(),
});

export const insertCreditsSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  reason: z.string(),
});

// Types
export type User = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Credit = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  createdAt: Date;
};

export type InsertCredit = z.infer<typeof insertCreditsSchema>;

export type SavedContent = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  contentId: string;
  source: string;
  content: string;
  contentUrl?: string;
  createdAt: Date;
};

export type InsertSavedContent = z.infer<typeof insertSavedContentSchema>;

export type ReportedContent = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  contentId: string;
  source: string;
  reason: string;
  additionalDetails?: string;
  createdAt: Date;
};

export type InsertReportedContent = z.infer<typeof insertReportedContentSchema>;

// Social feed content type (not stored in database, used for API responses)
export type FeedItem = {
  id: string;
  source: "twitter" | "reddit" | "linkedin";
  authorName: string;
  authorUsername?: string;
  authorProfileImage?: string;
  content: string;
  contentUrl?: string;
  postedAt: string;
  engagementStats?: {
    likes?: number;
    comments?: number;
    shares?: number;
    retweets?: number;
    upvotes?: number;
  };
  media?: {
    type: "image" | "video" | "poll";
    url?: string;
    pollOptions?: Array<{
      text: string;
      percentage: number;
    }>;
  };
  subreddit?: string;
};
