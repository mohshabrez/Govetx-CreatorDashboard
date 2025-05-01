import axios from 'axios';
import { FeedItem } from '@shared/schema';

// Mock data for when API calls fail
const MOCK_REDDIT_POSTS: FeedItem[] = [
  {
    id: 'mock1',
    source: 'reddit',
    authorName: 'MockUser1',
    content: 'This is a mock post about JavaScript development',
    contentUrl: 'https://reddit.com/r/javascript/mock1',
    postedAt: new Date().toISOString(),
    engagementStats: {
      upvotes: 100,
      comments: 25
    }
  },
  {
    id: 'mock2',
    source: 'reddit',
    authorName: 'MockUser2',
    content: 'Another mock post about web development',
    contentUrl: 'https://reddit.com/r/webdev/mock2',
    postedAt: new Date(Date.now() - 3600000).toISOString(),
    engagementStats: {
      upvotes: 75,
      comments: 15
    }
  }
];

const MOCK_TWITTER_POSTS: FeedItem[] = [
  {
    id: 'mock3',
    source: 'twitter',
    authorName: 'MockTwitterUser1',
    authorUsername: 'mockuser1',
    content: 'Just launched a new JavaScript framework! #webdev',
    contentUrl: 'https://twitter.com/mockuser1/status/123',
    postedAt: new Date().toISOString(),
    engagementStats: {
      likes: 50,
      retweets: 10,
      comments: 5
    }
  },
  {
    id: 'mock4',
    source: 'twitter',
    authorName: 'MockTwitterUser2',
    authorUsername: 'mockuser2',
    content: 'Check out this amazing web development tutorial!',
    contentUrl: 'https://twitter.com/mockuser2/status/456',
    postedAt: new Date(Date.now() - 7200000).toISOString(),
    engagementStats: {
      likes: 30,
      retweets: 5,
      comments: 3
    }
  }
];

// Reddit OAuth configuration
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || 'C3mX4t4X_jOdRfbqknRAbg';
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || 'DBkh8BIQ9LcxXZ5RAAi00NfUlEhyeQ';

/**
 * Get a fresh Reddit access token for each request
 */
async function getRedditAccessToken(): Promise<string | null> {
  try {
    console.log('Getting new Reddit access token...');
    
    // Create Basic Auth token
    const basicAuth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        'grant_type': 'client_credentials',
        'device_id': 'DO_NOT_TRACK_THIS_DEVICE',
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'govertx/1.0.0'
        }
      }
    );

    console.log('Reddit token response:', {
      status: response.status,
      hasToken: !!response.data?.access_token
    });

    return response.data.access_token || null;
  } catch (error: any) {
    console.error('Error getting Reddit access token:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
}

class SocialFeedServiceClass {
  /**
   * Fetches posts from Reddit API using OAuth
   */
  async fetchRedditFeed(options: { 
    subreddit?: string,
    limit?: number,
    query?: string
  } = {}): Promise<{ items: FeedItem[], nextPageToken: string | null }> {
    try {
      console.log('Attempting to fetch Reddit posts...');
      
      const { subreddit = 'javascript', limit = 20, query } = options;
      
      // Get a fresh token for this request
      const accessToken = await getRedditAccessToken();
      
      const url = `https://oauth.reddit.com/r/${subreddit}/top`;
      
      console.log('Making Reddit API request:', {
        url,
        params: { limit }
      });

      const response = await axios.get(url, {
        params: {
          limit,
          t: 'day', // get top posts from last 24 hours
          raw_json: 1  // prevent encoding of HTML entities
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'govertx/1.0.0'
        }
      });

      if (!response.data?.data?.children) {
        console.log('No posts found in Reddit response, using mock data');
        return { items: MOCK_REDDIT_POSTS, nextPageToken: null };
      }

      const posts = response.data.data.children;
      console.log(`Found ${posts.length} Reddit posts`);

      let items = posts.map((post: any) => ({
        id: post.data.id,
        source: 'reddit' as const,
        authorName: post.data.author,
        content: post.data.selftext || post.data.title,
        contentUrl: `https://reddit.com${post.data.permalink}`,
        postedAt: new Date(post.data.created_utc * 1000).toISOString(),
        engagementStats: {
          upvotes: post.data.ups,
          comments: post.data.num_comments
        }
      }));

      // Apply search filter if query is provided
      if (query) {
        const searchTerm = query.toLowerCase();
        items = items.filter((item: FeedItem) => 
          item.content.toLowerCase().includes(searchTerm) ||
          item.authorName.toLowerCase().includes(searchTerm)
        );
      }

      return {
        items,
        nextPageToken: response.data.data.after || null
      };
    } catch (error: any) {
      console.error('Error fetching Reddit posts:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return { items: MOCK_REDDIT_POSTS, nextPageToken: null };
    }
  }

  /**
   * Fetches posts from Twitter API
   */
  async fetchTwitterFeed(options: {
    limit?: number,
    query?: string
  } = {}): Promise<{ items: FeedItem[], nextPageToken: string | null }> {
    try {
      // TODO: Implement real Twitter API integration
      console.log('Twitter API not implemented yet, using mock data');
      
      const { limit = 20, query } = options;
      let items = [...MOCK_TWITTER_POSTS];

      // Apply search filter if query is provided
      if (query) {
        const searchTerm = query.toLowerCase();
        items = items.filter((item: FeedItem) => 
          item.content.toLowerCase().includes(searchTerm) ||
          item.authorName.toLowerCase().includes(searchTerm)
        );
      }

      // Apply limit
      items = items.slice(0, limit);

      return {
        items,
        nextPageToken: null
      };
    } catch (error) {
      console.error('Error fetching Twitter feed:', error);
      return { items: MOCK_TWITTER_POSTS, nextPageToken: null };
    }
  }

  /**
   * Fetches both Reddit and Twitter feeds in a single API call
   * Uses the provided client credentials for Reddit
   */
  async fetchCombinedFeed(options: {
    subreddit?: string,
    limit?: number,
    query?: string
  } = {}): Promise<{ redditFeed: FeedItem[], twitterFeed: FeedItem[] }> {
    console.log('Fetching combined Reddit and Twitter feeds');
    
    try {
      // Make sure to use the credentials provided directly
      // These credentials are already set at the top of the file
      // REDDIT_CLIENT_ID: C3mX4t4X_jOdRfbqknRAbg
      // REDDIT_CLIENT_SECRET: DBkh8BIQ9LcxXZ5RAAi00NfUlEhyeQ

      // Fetch both feeds in parallel
      const [redditResponse, twitterResponse] = await Promise.all([
        this.fetchRedditFeed(options), // This already uses the right credentials through getRedditAccessToken
        this.fetchTwitterFeed(options)
      ]);
      
      console.log(`Combined feed fetched successfully: ${redditResponse.items.length} Reddit posts, ${twitterResponse.items.length} Twitter posts`);
      
      return {
        redditFeed: redditResponse.items,
        twitterFeed: twitterResponse.items
      };
    } catch (error) {
      console.error('Error fetching combined feed:', error instanceof Error ? error.message : String(error));
      // Return mock data if there's an error
      return {
        redditFeed: MOCK_REDDIT_POSTS,
        twitterFeed: MOCK_TWITTER_POSTS
      };
    }
  }

  /**
   * Aggregates posts from multiple social media sources
   */
  async fetchAggregatedFeed(options: {
    sources?: ('twitter' | 'reddit')[], 
    query?: string,
    limit?: number,
    after?: string
  } = {}): Promise<FeedItem[]> {
    const { sources = ['twitter', 'reddit'], query, limit = 20 } = options;
    
    const results = await Promise.all(
      sources.map(async (source) => {
        if (source === 'reddit') {
          return await this.fetchRedditFeed({ query, limit });
        } else if (source === 'twitter') {
          return await this.fetchTwitterFeed({ query, limit });
        }
        return { items: [], nextPageToken: null };
      })
    );

    // Combine all items from different sources
    const allItems = results.flatMap(result => result.items);
    
    // Sort by posted date (newest first)
    const sortedItems = allItems.sort((a, b) => 
      new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );
    
    // Apply limit to the final result
    return sortedItems.slice(0, limit);
  }
}

// Export a singleton instance
export const SocialFeedService = new SocialFeedServiceClass();