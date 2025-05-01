// Add Twitter API proxy endpoint
app.get('/api/twitter-proxy', async (req, res) => {
  try {
    // Get parameters from the request
    const { endpoint = 'tweets' } = req.query;
    
    // Base URL for Twitter API v2
    const baseUrl = `https://api.twitter.com/2/${endpoint}`;
    
    // Prepare parameters for Twitter API
    // const params = {};
    // if (query) params.query = query;
    // if (limit || max_results) params.max_results = limit || max_results || 20;
    
    // // Add additional Twitter API parameters
    // params.tweet_fields = 'created_at,public_metrics,entities,attachments';
    // params.expansions = 'author_id,attachments.media_keys';
    // params.user_fields = 'name,username,profile_image_url';
    // params.media_fields = 'url,preview_image_url,type';
    
    // console.log(`Proxying Twitter API request to ${baseUrl}`, params);
    
    // Make the request to Twitter API
    const response = await axios.get(baseUrl, {
      params,
      headers: {
        'Authorization': `Bearer AAAAAAAAAAAAAAAAAAAAANbU0wEAAAAAZySZWJ%2BnILu74Rd6CXDsKr%2Blzfs%3DWOwWiBur3Nv4tGTM4BWW3DvShzg7zEXKwpg4HGTvkNuH90Av5E`,
        'Content-Type': 'application/json'
      }
    });
    
    // Return the response from Twitter API
    res.json(response.data);
  } catch (error) {
    console.error('Twitter API proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Twitter API failed', 
      details: error.response?.data || error.message 
    });
  }
}); 