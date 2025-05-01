import axios from 'axios';

// Types
interface RedditFeedOptions {
  subreddit?: string;
  query?: string;
  limit?: number;
}

interface TwitterFeedOptions {
  query?: string;
  limit?: number;
}

interface FeedItem {
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
}

interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string;
}

export const SocialFeedService = {
  async fetchRedditFeed(options: RedditFeedOptions): Promise<FeedResponse> {
    console.log('SocialFeedService.fetchRedditFeed called with options:', options);
    
    const { subreddit = 'javascript', limit = 20 } = options;
    
    try {
      // Use direct .json endpoint - no authentication required
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
        {
          headers: {
            'User-Agent': 'CreatorFeed/1.0'
          }
        }
      );
      
      const items: FeedItem[] = response.data.data.children.map((post: any) => ({
        id: post.data.id,
        source: 'reddit',
        authorName: post.data.author,
        authorUsername: post.data.author,
        authorProfileImage: '', // Reddit doesn't provide this easily
        content: post.data.selftext || post.data.title,
        contentUrl: `https://reddit.com${post.data.permalink}`,
        postedAt: new Date(post.data.created_utc * 1000).toISOString(),
        engagementStats: {
          upvotes: post.data.ups,
          comments: post.data.num_comments,
        },
        subreddit: post.data.subreddit,
        media: post.data.thumbnail && post.data.thumbnail !== 'self' && post.data.thumbnail !== 'default' ? {
          type: 'image',
          url: post.data.thumbnail
        } : undefined
      }));

      console.log(`Fetched ${items.length} Reddit items`);
      
      return {
        items,
        nextCursor: items.length > 0 ? items[items.length - 1].id : undefined
      };
    } catch (error) {
      console.error('Error in fetchRedditFeed:', error);
      
      // Generate fallback mock data if API call fails
      console.log('Generating fallback mock data for Reddit');
      const items: FeedItem[] = Array.from({ length: options.limit || 20 }, (_, i) => ({
        id: `reddit-${i + 1}`,
        source: 'reddit',
        authorName: `Reddit User ${i + 1}`,
        authorUsername: `redditor${i + 1}`,
        authorProfileImage: `https://i.pravatar.cc/150?u=reddit${i + 1}`,
        content: `This is a sample Reddit post about ${subreddit} topic. #${i + 1}`,
        contentUrl: `https://reddit.com/r/${subreddit}/comments/${i + 1}`,
        postedAt: new Date(Date.now() - i * 3600000).toISOString(),
        engagementStats: {
          upvotes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
        },
        subreddit: subreddit,
      }));
      
      return {
        items,
        nextCursor: items.length > 0 ? items[items.length - 1].id : undefined
      };
    }
  },

  async fetchTwitterFeed(options: TwitterFeedOptions): Promise<FeedResponse> {
    console.log('SocialFeedService.fetchTwitterFeed called with options:', options);
    
    const { limit = 20 } = options;
    
    try {
      // We'll implement mock data here since Twitter API requires a paid API access now
      const items: FeedItem[] = Array.from({ length: limit }, (_, i) => ({
        id: `twitter-${i + 1}`,
        source: 'twitter',
        authorName: `Twitter User ${i + 1}`,
        authorUsername: `@twitteruser${i + 1}`,
        authorProfileImage: `https://i.pravatar.cc/150?u=twitter${i + 1}`,
        content: `This is a sample tweet #${i + 1}. #webdev #javascript #reactjs`,
        contentUrl: `https://twitter.com/user/status/${i + 1}`,
        postedAt: new Date(Date.now() - i * 3600000).toISOString(),
        engagementStats: {
          likes: Math.floor(Math.random() * 500),
          retweets: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
        },
        media: i % 3 === 0 ? {
          type: 'image',
          url: `https://picsum.photos/600/400?random=${i}`
        } : undefined
      }));

      console.log(`Generated ${items.length} mock Twitter items`);
      
      return {
        items,
        nextCursor: items.length > 0 ? items[items.length - 1].id : undefined
      };
    } catch (error) {
      console.error('Error in fetchTwitterFeed:', error);
      throw new Error('Failed to fetch Twitter feed');
    }
  }
}; 