import express, { Request, Response } from 'express';
import { StreamingLinksService } from '../services/StreamingLinkService';

const router = express.Router();
const streamingLinksService = new StreamingLinksService();

// POST /api/streaming-links - Add or update streaming links for a movie
router.post('/add', async (req: Request, res: Response) => {
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

// GET /api/streaming-links/:movieName - Get streaming links for a specific movie
router.get('/:movieName', async (req: Request, res: Response) => {
  try {
    const movieName = req.params.movieName;
    const streamingLinks = await streamingLinksService.getStreamingLinks(movieName);
    if (streamingLinks) {
      res.json(streamingLinks);
    } else {
      res.status(404).json({ message: `Streaming links not found for movie: ${movieName}` });
    }
  } catch (error) {
    console.error('Error getting streaming links:', error);
    res.status(500).json({ error: 'Failed to retrieve streaming links.' });
  }
});

module.exports = router;