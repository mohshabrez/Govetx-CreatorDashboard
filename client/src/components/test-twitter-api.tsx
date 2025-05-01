import { useState } from 'react';
import { fetchTwitterFeedDirect } from '@/lib/socialApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FeedItem } from '@shared/schema';

// Twitter API response types
interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface TwitterMedia {
  media_key: string;
  type: string;
  url?: string;
  preview_image_url?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    reply_count: number;
    retweet_count: number;
  };
  attachments?: {
    media_keys: string[];
  };
}

interface TwitterApiResponse {
  data: TwitterTweet[];
  includes?: {
    users?: TwitterUser[];
    media?: TwitterMedia[];
  };
  meta?: {
    next_token?: string;
  };
}

// Twitter API bearer token
const TWITTER_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANbU0wEAAAAAZySZWJ%2BnILu74Rd6CXDsKr%2Blzfs%3DWOwWiBur3Nv4tGTM4BWW3DvShzg7zEXKwpg4HGTvkNuH90Av5E';

// Direct implementation within the component
const fetchTwitterDirectly = async ({ 
  query, 
  limit = 10 
}: {
  query?: string;
  limit?: number;
}): Promise<{ items: FeedItem[], nextPageToken: string | null }> => {
  // Build the API URL - Twitter API v2
  let url = 'https://api.twitter.com/2/tweets/search/recent';
  
  // Add query parameters
  const queryParams = new URLSearchParams();
  // If no query is provided, default to a tech-related query
  queryParams.append('query', query || 'javascript OR webdev OR programming -is:retweet');
  queryParams.append('max_results', limit.toString());
  queryParams.append('tweet.fields', 'created_at,public_metrics,entities,attachments');
  queryParams.append('expansions', 'author_id,attachments.media_keys');
  queryParams.append('user.fields', 'name,username,profile_image_url');
  queryParams.append('media.fields', 'url,preview_image_url,type');
  
  url = `${url}?${queryParams.toString()}`;
  
  console.log('Fetching from Twitter API:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} ${await response.text()}`);
  }
  
  const data: TwitterApiResponse = await response.json();
  console.log('Raw Twitter API response:', data);
  
  // Transform Twitter API response to our app's format
  const items: FeedItem[] = [];
  
  // Create a map of users for easy lookup
  const users = new Map<string, TwitterUser>();
  if (data.includes?.users) {
    data.includes.users.forEach((user: TwitterUser) => {
      users.set(user.id, user);
    });
  }
  
  // Create a map of media for easy lookup
  const mediaMap = new Map<string, TwitterMedia>();
  if (data.includes?.media) {
    data.includes.media.forEach((mediaItem: TwitterMedia) => {
      mediaMap.set(mediaItem.media_key, mediaItem);
    });
  }
  
  // Process each tweet
  if (data.data) {
    data.data.forEach((tweet: TwitterTweet) => {
      const author = users.get(tweet.author_id);
      
      // Determine media content
      let media: {
        type: "image" | "video" | "poll";
        url?: string;
        pollOptions?: Array<{
          text: string;
          percentage: number;
        }>;
      } | undefined = undefined;
      
      if (tweet.attachments?.media_keys && tweet.attachments.media_keys.length > 0) {
        const mediaKey = tweet.attachments.media_keys[0];
        const mediaItem = mediaMap.get(mediaKey);
        
        if (mediaItem) {
          if (mediaItem.type === 'photo') {
            media = { 
              type: 'image', 
              url: mediaItem.url || mediaItem.preview_image_url 
            };
          } else if (mediaItem.type === 'video') {
            media = { 
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
        media
      });
    });
  }
  
  return {
    items,
    nextPageToken: data.meta?.next_token || null
  };
};

const TwitterApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeedItem[]>([]);
  const [query, setQuery] = useState('');
  const [useDirectImplementation, setUseDirectImplementation] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (useDirectImplementation) {
        // Use our direct implementation
        response = await fetchTwitterDirectly({
          query: query || undefined,
          limit: 10
        });
      } else {
        // Use the imported function
        response = await fetchTwitterFeedDirect({
          query: query || undefined,
          limit: 10
        });
      }
      
      setResults(response.items);
      console.log('Twitter API Response:', response);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching data');
      console.error('Twitter API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Twitter API Direct Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search Query (optional)</label>
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="e.g. javascript OR webdev OR programming -is:retweet"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to use default query (javascript OR webdev OR programming -is:retweet)
            </p>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={useDirectImplementation}
                onChange={(e) => setUseDirectImplementation(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>Use direct implementation (more reliable for testing)</span>
            </label>
          </div>
          
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Test Twitter API'}
          </Button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>
      
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Results ({results.length})</h2>
          <div className="space-y-4">
            {results.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    {item.authorProfileImage ? (
                      <img 
                        src={item.authorProfileImage} 
                        alt={item.authorName}
                        className="w-10 h-10 rounded-full mr-3" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-500 font-bold">{item.authorName.substring(0, 1)}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{item.authorName}</div>
                      <div className="text-sm text-gray-500">@{item.authorUsername}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-gray-700">
                    {item.content}
                  </div>
                  
                  {item.media?.type === 'image' && item.media.url && (
                    <div className="mt-3">
                      <img 
                        src={item.media.url} 
                        alt="Tweet media" 
                        className="max-h-64 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x200?text=Image+Load+Error';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(item.postedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      ❤️ {item.engagementStats?.likes || 0}
                    </span>
                    <span>
                      🔄 {item.engagementStats?.retweets || 0}
                    </span>
                    <span>
                      💬 {item.engagementStats?.comments || 0}
                    </span>
                    <a 
                      href={item.contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-600 hover:underline"
                    >
                      View on Twitter
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TwitterApiTest; 