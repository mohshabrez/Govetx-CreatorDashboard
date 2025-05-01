import mongoose from 'mongoose';

// Credit schema for tracking user credits
const creditSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true,
    enum: [
      'login_bonus',
      'profile_completion',
      'feed_interaction',
      'content_save',
      'admin_grant',
      'other'
    ]
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { 
  timestamps: true 
});

// Create indexes for faster queries
creditSchema.index({ userId: 1, createdAt: -1 });

export const Credit = mongoose.model('Credit', creditSchema); 