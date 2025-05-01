import { Router } from 'express';
import { SocialFeedService } from '../../services/socialFeed';

const router = Router();

// Feed endpoint that works without user authentication
router.get('/api/feed', async (req, res) => {
  try {
    const { sources, query, limit, after } = req.query;
    
    const feed = await SocialFeedService.fetchAggregatedFeed({
      sources: sources ? (sources as string).split(',') as ('twitter' | 'reddit')[] : undefined,
      query: query as string,
      limit: limit ? parseInt(limit as string) : undefined,
      after: after as string
    });
    
    res.json(feed);
  } catch (error) {
    console.error('Error in feed endpoint:', error);
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

export default router; 