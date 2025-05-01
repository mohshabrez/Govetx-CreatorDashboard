// Define basic types used across both client and server
import mongoose from 'mongoose';
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).default('user'),
});

export type InsertUser = z.infer<typeof userSchema>;
// Use different name to avoid conflicts with models/user.ts
export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Check if model exists already to prevent overwrite errors
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Credit schema
export const creditSchema = z.object({
  userId: z.string(),
  amount: z.number().int(),
  reason: z.string(),
});

export const insertCreditsSchema = creditSchema;
export type InsertCredit = z.infer<typeof creditSchema>;
// Use different name to avoid conflicts with models/credit.ts
export const CreditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
}, { timestamps: true });

// Check if model exists already to prevent overwrite errors
export const Credit = mongoose.models.Credit || mongoose.model('Credit', CreditSchema);

// Saved content schema
export const savedContentSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  source: z.enum(['reddit', 'twitter']),
  contentUrl: z.string().url(),
  content: z.string(),
  authorName: z.string(),
});

export const insertSavedContentSchema = savedContentSchema;
export type InsertSavedContent = z.infer<typeof savedContentSchema>;
export const SavedContent = mongoose.model('SavedContent', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: String, required: true },
  source: { type: String, enum: ['reddit', 'twitter'], required: true },
  contentUrl: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
}, { timestamps: true }));

// Reported content schema
export const reportedContentSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  source: z.enum(['reddit', 'twitter']),
  contentUrl: z.string().url(),
  reason: z.string(),
});

export const insertReportedContentSchema = reportedContentSchema;
export type InsertReportedContent = z.infer<typeof reportedContentSchema>;
export const ReportedContent = mongoose.model('ReportedContent', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: String, required: true },
  source: { type: String, enum: ['reddit', 'twitter'], required: true },
  contentUrl: { type: String, required: true },
  reason: { type: String, required: true },
}, { timestamps: true }));

// Feed item type
export type FeedItem = {
  id: string;
  source: 'reddit' | 'twitter';
  authorName: string;
  authorUsername?: string;
  content: string;
  contentUrl: string;
  postedAt: string;
  engagementStats: {
    upvotes?: number;
    likes?: number;
    retweets?: number;
    comments?: number;
  };
}; 