import { useState, useEffect } from 'react';
import { fetchRedditFeedDirect } from '@/lib/socialApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const RedditApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [subreddit, setSubreddit] = useState('javascript');
  const [query, setQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchRedditFeedDirect({
        subreddit,
        query: query || undefined,
        limit: 5
      });
      
      setResults(response.items);
      console.log('API Response:', response);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reddit API Direct Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Subreddit</label>
              <Input 
                value={subreddit} 
                onChange={(e) => setSubreddit(e.target.value)} 
                placeholder="e.g. javascript"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Search Query (optional)</label>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search term"
              />
            </div>
          </div>
          
          <Button 
            onClick={fetchData} 
            disabled={loading || !subreddit}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Test Reddit API'}
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
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Posted by u/{item.author} • {new Date(item.postedAt).toLocaleString()}
                  </div>
                  
                  {item.content && (
                    <div className="mt-2 text-gray-700">
                      {item.content.length > 200 
                        ? `${item.content.substring(0, 200)}...` 
                        : item.content}
                    </div>
                  )}
                  
                  {item.media?.type === 'image' && (
                    <div className="mt-3">
                      <img 
                        src={item.media.url} 
                        alt="Post media" 
                        className="max-h-64 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x200?text=Image+Load+Error';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <span className="mr-4">
                      ⬆️ {item.upvotes || 0} upvotes
                    </span>
                    <span>
                      💬 {item.comments || 0} comments
                    </span>
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-600 hover:underline"
                    >
                      View on Reddit
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

export default RedditApiTest; 