import { FeedItem } from "@shared/schema";
import axios from "axios";
import { getStoredToken } from "./queryClient";

// Create an axios instance with default config
export const api = axios.create({
  baseURL: 'http://localhost:5000', // Server is running on port 5000
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Making request to:', `${config.baseURL || ''}${config.url || ''}`);
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/api/')) {
      console.log('API Response:', {
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message
    });
    return Promise.reject(error);
  }
);

export interface CreditData {
  total: number;
  credits: {
    amount: number;
    reason: string;
    createdAt: string;
  }[];
}

export interface SaveContentRequest {
  contentId: string;
  source: string;
  content: string;
  contentUrl?: string;
}

export interface ReportContentRequest {
  contentId: string;
  source: string;
  reason: string;
  details?: string;
}

export async function reportContent(data: ReportContentRequest) {
  try {
    const response = await api.post('/api/report-content', data);
    return response.data;
  } catch (error) {
    console.error('Error reporting content:', error);
    throw error;
  }
}

export async function saveContent(data: SaveContentRequest) {
  try {
    const response = await api.post('/api/saved-content', data);
    return response.data;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

export async function deleteSavedContent(contentId: string) {
  try {
    const response = await api.delete(`/api/saved-content/${contentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting saved content:', error);
    throw error;
  }
}

export async function getCredits(): Promise<CreditData> {
  try {
    const response = await api.get('/api/credits');
    return response.data;
  } catch (error) {
    console.error('Error fetching credits:', error);
    return {
      total: 0,
      credits: []
    };
  }
}

export async function getSavedContent() {
  try {
    const response = await api.get('/api/saved-content');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved content:', error);
    return [];
  }
}

export async function fetchFeed(params: { 
  sources?: string[], 
  query?: string, 
  limit?: number,
  after?: string 
}): Promise<{ items: FeedItem[], nextPageToken: string | null }> {
  try {
    const response = await api.get('/api/feed', { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
}

// Reddit API integration with direct authentication
export const redditClientId = 'C3mX4t4X_jOdRfbqknRAbg';
export const redditClientSecret = 'DBkh8BIQ9LcxXZ5RAAi00NfUlEhyeQ';

// Fetch Reddit access token
export async function getRedditAccessToken(): Promise<string> {
  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${redditClientId}:${redditClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Reddit access token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Reddit access token:', error);
    throw error;
  }
}

// Fetch Reddit feed directly from the API
export async function fetchRedditFeedDirect(params: { 
  subreddit: string,
  query?: string, 
  limit?: number
}): Promise<{ items: FeedItem[], nextPageToken: string | null }> {
  try {
    const { subreddit, query, limit = 20 } = params;
    
    // Get the access token first
    const accessToken = await getRedditAccessToken();
    
    // Build the API URL
    let url = `https://oauth.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    if (query) {
      url = `https://oauth.reddit.com/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sr_detail=1&limit=${limit}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'CreatorFeed/1.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform Reddit API response to our app's format
    const items = data.data.children.map((child: any) => {
      const post = child.data;
      
      // Determine media type
      let media = null;
      if (post.is_video) {
        media = { type: 'video', url: post.media?.reddit_video?.fallback_url };
      } else if (post.post_hint === 'image' || /\.(jpg|jpeg|png|gif)$/.test(post.url)) {
        media = { type: 'image', url: post.url };
      } else if (post.poll_data) {
        media = { type: 'poll', data: post.poll_data };
      }
      
      return {
        id: post.id,
        title: post.title,
        content: post.selftext,
        author: post.author,
        postedAt: new Date(post.created_utc * 1000).toISOString(),
        source: 'reddit',
        sourceUrl: `https://reddit.com${post.permalink}`,
        upvotes: post.ups,
        comments: post.num_comments,
        media,
        subreddit: post.subreddit,
      };
    });
    
    return {
      items,
      nextPageToken: data.data.after
    };
  } catch (error) {
    console.error('Error fetching Reddit feed:', error);
    throw error;
  }
}

// Keep existing functions but we'll modify the feed.tsx to use our new direct API
export const fetchRedditFeed = async (params: { subreddit: string, query?: string, limit?: number }): Promise<{ items: FeedItem[], nextPageToken: string | null }> => {
  // This would typically call your backend API, but we'll keep it for compatibility
  const { subreddit, query, limit = 20 } = params;
  const response = await fetch(`/api/feed/reddit?subreddit=${subreddit}&limit=${limit}${query ? `&query=${query}` : ''}`);
  return response.json();
};

// Twitter API integration with direct authentication
export const twitterBearerToken = 'AAAAAAAAAAAAAAAAAAAAANbU0wEAAAAAZySZWJ%2BnILu74Rd6CXDsKr%2Blzfs%3DWOwWiBur3Nv4tGTM4BWW3DvShzg7zEXKwpg4HGTvkNuH90Av5E';

// Fetch Twitter feed directly from the API (via our proxy)
export async function fetchTwitterFeedDirect(params: { 
  query?: string, 
  limit?: number
}): Promise<{ items: FeedItem[], nextPageToken: string | null }> {
  try {
    const { query, limit = 20 } = params;
    
    // Using our backend proxy endpoint to avoid CORS issues
    console.log('Using Twitter API via server proxy');
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('query', query);
    queryParams.append('max_results', limit.toString());
    queryParams.append('endpoint', 'tweets/search/recent');
    
    const response = await fetch(`/api/twitter-proxy?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform Twitter API response to our app's format
    const items: FeedItem[] = [];
    
    // Create a map of users for easy lookup
    const users = new Map();
    if (data.includes?.users) {
      data.includes.users.forEach((user: any) => {
        users.set(user.id, user);
      });
    }
    
    // Create a map of media for easy lookup
    const media = new Map();
    if (data.includes?.media) {
      data.includes.media.forEach((mediaItem: any) => {
        media.set(mediaItem.media_key, mediaItem);
      });
    }
    
    // Process each tweet
    if (data.data) {
      data.data.forEach((tweet: any) => {
        const author = users.get(tweet.author_id);
        
        // Determine media content
        let mediaContent: {
          type: "image" | "video" | "poll";
          url?: string;
          pollOptions?: Array<{
            text: string;
            percentage: number;
          }>;
        } | undefined = undefined;
        
        if (tweet.attachments?.media_keys && tweet.attachments.media_keys.length > 0) {
          const mediaKey = tweet.attachments.media_keys[0];
          const mediaItem = media.get(mediaKey);
          
          if (mediaItem) {
            if (mediaItem.type === 'photo') {
              mediaContent = { 
                type: 'image', 
                url: mediaItem.url || mediaItem.preview_image_url 
              };
            } else if (mediaItem.type === 'video') {
              mediaContent = { 
                type: 'video', 
                url: mediaItem.preview_image_url 
              };
            }
          }
        }
        
        items.push({
          id: tweet.id,
          source: 'twitter',
          authorName: author?.name || 'Unknown',
          authorUsername: author?.username,
          authorProfileImage: author?.profile_image_url,
          content: tweet.text,
          contentUrl: `https://twitter.com/${author?.username}/status/${tweet.id}`,
          postedAt: tweet.created_at,
          engagementStats: {
            likes: tweet.public_metrics?.like_count || 0,
            comments: tweet.public_metrics?.reply_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0
          },
          media: mediaContent
        });
      });
    }
    
    return {
      items,
      nextPageToken: data.meta?.next_token || null
    };
  } catch (error) {
    console.error('Error fetching Twitter feed:', error);
    // Fallback to the existing backend endpoint if our proxy fails
    console.log('Falling back to legacy Twitter API endpoint');
    try {
      const { query, limit = 20 } = params;
      const response = await fetch(`/api/feed/twitter?limit=${limit}${query ? `&query=${query}` : ''}`);
      return response.json();
    } catch (fallbackError) {
      console.error('Error using fallback Twitter API:', fallbackError);
      return { items: [], nextPageToken: null };
    }
  }
}

export const fetchTwitterFeed = async (params: { query?: string, limit?: number }): Promise<{ items: FeedItem[], nextPageToken: string | null }> => {
  const { query, limit = 20 } = params;
  const response = await fetch(`/api/feed/twitter?limit=${limit}${query ? `&query=${query}` : ''}`);
  return response.json();
};

export const fetchCombinedFeed = async (params: { subreddit: string, query?: string, limit?: number }): Promise<{ redditFeed: FeedItem[], twitterFeed: FeedItem[] }> => {
  const { subreddit, query, limit = 20 } = params;
  
  // Fetch Reddit feed directly
  const redditResponse = await fetchRedditFeedDirect({
    subreddit,
    query,
    limit
  }).catch(error => {
    console.error('Error fetching Reddit feed directly:', error);
    return { items: [], nextPageToken: null };
  });
  
  // For Twitter, use our direct implementation which now uses the proxy
  const twitterResponse = await fetchTwitterFeedDirect({
    query: query,
    limit
  }).catch(error => {
    console.error('Error fetching Twitter feed via proxy:', error);
    return { items: [], nextPageToken: null };
  });
  
  // Return combined feed data
  return {
    redditFeed: redditResponse.items,
    twitterFeed: twitterResponse.items
  };
};