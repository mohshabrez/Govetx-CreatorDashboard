import axios from 'axios';
import { FeedItem } from '@shared/schema';

// Function to fetch tweets from Twitter
export async function fetchTwitterFeed(): Promise<Partial<FeedItem>[]> {
  try {
    const twitterToken = process.env.TWITTER_TOKEN;
    
    if (!twitterToken) {
      console.warn("TWITTER_TOKEN not set, returning mock data");
      return getMockTwitterPosts();
    }
    
    const apiUrl = 'https://api.twitter.com/2/tweets/search/recent';
    const params = {
      query: '(tech OR programming OR development) -is:retweet',
      'tweet.fields': 'created_at,author_id,public_metrics,entities',
      'user.fields': 'name,username,profile_image_url',
      'media.fields': 'url,preview_image_url',
      'expansions': 'author_id,attachments.media_keys',
      'max_results': 25
    };
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${twitterToken}`
      },
      params
    });
    
    const tweets = response.data.data;
    const users = response.data.includes?.users || [];
    const media = response.data.includes?.media || [];
    
    // Transform tweets to our FeedItem format
    return tweets.map((tweet: any) => {
      const user = users.find((u: any) => u.id === tweet.author_id);
      
      let mediaUrl = null;
      if (tweet.attachments?.media_keys) {
        const tweetMedia = media.find((m: any) => 
          m.media_key === tweet.attachments.media_keys[0]
        );
        mediaUrl = tweetMedia?.url || tweetMedia?.preview_image_url;
      }
      
      // Extract URL if present in entities
      let tweetUrl = null;
      if (tweet.entities?.urls?.length > 0) {
        tweetUrl = tweet.entities.urls[0].expanded_url;
      }
      
      return {
        externalId: tweet.id,
        author: user?.name || 'Twitter User',
        authorUsername: user?.username || '',
        authorProfileImage: user?.profile_image_url || '',
        content: tweet.text,
        mediaUrl,
        publishedAt: new Date(tweet.created_at),
        platformType: 'twitter',
        url: tweetUrl || `https://twitter.com/${user?.username}/status/${tweet.id}`
      };
    });
    
  } catch (error) {
    console.error('Error fetching Twitter feed:', error);
    return getMockTwitterPosts();
  }
}

// Function to fetch posts from Reddit
export async function fetchRedditFeed(): Promise<Partial<FeedItem>[]> {
  try {
    const subreddits = ['programming', 'webdev', 'technology', 'javascript', 'reactjs'];
    const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
    
    const apiUrl = `https://www.reddit.com/r/${randomSubreddit}/hot.json`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'GoVertX/1.0'
      },
      params: {
        limit: 25
      }
    });
    
    const posts = response.data.data.children;
    
    // Transform Reddit posts to our FeedItem format
    return posts.map((post: any) => {
      const postData = post.data;
      
      let mediaUrl = null;
      if (postData.thumbnail && postData.thumbnail !== 'self' && postData.thumbnail !== 'default') {
        mediaUrl = postData.thumbnail;
      } else if (postData.preview?.images?.[0]?.source?.url) {
        mediaUrl = postData.preview.images[0].source.url;
      }
      
      return {
        externalId: postData.id,
        author: postData.author,
        authorUsername: postData.author,
        authorProfileImage: '',
        content: postData.title + (postData.selftext ? `\n\n${postData.selftext.substring(0, 200)}${postData.selftext.length > 200 ? '...' : ''}` : ''),
        mediaUrl,
        publishedAt: new Date(postData.created_utc * 1000),
        platformType: 'reddit',
        url: `https://reddit.com${postData.permalink}`
      };
    });
    
  } catch (error) {
    console.error('Error fetching Reddit feed:', error);
    return getMockRedditPosts();
  }
}

// Mock Twitter posts if API fails
function getMockTwitterPosts(): Partial<FeedItem>[] {
  return [
    {
      externalId: 'tweet-1',
      author: 'TechInsider',
      authorUsername: 'techinsider',
      authorProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'The latest iPhone update includes groundbreaking AI features that will change how you use your phone. Here\'s what you need to know about the update and when you can expect it.',
      mediaUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      platformType: 'twitter',
      url: 'https://twitter.com/techinsider/status/1'
    },
    {
      externalId: 'tweet-2',
      author: 'CodingNews',
      authorUsername: 'coding_news',
      content: 'TypeScript 5.0 has been released with exciting new features that make it even more powerful. Check out our latest blog post with a detailed analysis of the improvements.',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      platformType: 'twitter',
      url: 'https://twitter.com/coding_news/status/2'
    }
  ];
}

// Mock Reddit posts if API fails
function getMockRedditPosts(): Partial<FeedItem>[] {
  return [
    {
      externalId: 'reddit-1',
      author: 'developer123',
      authorUsername: 'developer123',
      content: 'Resources for learning React in 2023\n\nI\'ve compiled a list of the best resources for learning React this year. These include free tutorials, paid courses, and recommended reading.',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      platformType: 'reddit',
      url: 'https://reddit.com/r/webdev/comments/abc123'
    },
    {
      externalId: 'reddit-2',
      author: 'codemaster',
      authorUsername: 'codemaster',
      content: 'Just released my new open-source library for managing state in React applications. It\'s lightweight, fast, and has a simple API. Looking for contributors and feedback!',
      mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      platformType: 'reddit',
      url: 'https://reddit.com/r/reactjs/comments/def456'
    }
  ];
}
