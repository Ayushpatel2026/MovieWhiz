import express, { Request, Response } from 'express';
import { StreamingLinksService } from '../services/StreamingLinkService';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();
const streamingLinksService = new StreamingLinksService();

/*
  POST endpoint to add movie streaming info to the database
  THIS ENDPOINT IS NOT FOR THE FRONTEND TO USE, IT IS FOR US EASILY ADD NEW MOVIES TO DATABASE USING POSTMAN

  Example URL: http://{baseURL}/api/streaming-links/add
  Example Req Body:
  {
    "movieName": "The Matrix",
    "links": [
      {
        "service": "Netflix",
        "url": "https://www.netflix.com/watch/60012345"
      },
      {
        "service": "Amazon Prime",
        "url": "https://www.amazon.com/dp/B000123456"
      }
    ]
  }

  Returns a 200 status code if the streaming links are added/updated successfully.
  Returns a 400 status code if the request body is missing required fields.
  Returns a 500 status code if there is an error while adding/updating streaming links.

*/
router.post('/add', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { movieName, links } = req.body;
    if (!movieName || !Array.isArray(links)) {
      return res.status(400).json({ error: 'Missing movieName or links in the request body.' });
    }
    await streamingLinksService.addStreamingLinks(movieName, links);
    res.status(200).json({ message: `Streaming links updated for movie: ${movieName}` });
  } catch (error) {
    console.error('Error adding/updating streaming links:', error);
    res.status(500).json({ error: 'Failed to add/update streaming links.' });
  }
});

/*
  GET endpoint to retrieve streaming links for a specific movie.

  Example URL: http://{baseURL}/api/streaming-links/the-matrix
  Example Response:
  {
    "movieName": "The Matrix",
    "links": [
      {
        "service": "Netflix",
        "url": "https://www.netflix.com/watch/60012345"
      },
      {
        "service": "Amazon Prime",
        "url": "https://www.amazon.com/dp/B000123456"
      }
    ]
  }
  Returns a movie streaming info object if found.
*/
router.get('/:movieName', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const movieName = req.params.movieName;
    const streamingLinks = await streamingLinksService.getStreamingLinks(movieName);
    res.json(streamingLinks);
  } catch (error) {
    console.error('Error getting streaming links:', error);
    res.status(500).json({ error: 'Failed to retrieve streaming links.' });
  }
});

module.exports = router;