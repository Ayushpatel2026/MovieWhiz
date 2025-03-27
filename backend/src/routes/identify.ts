import express, { Request, Response } from 'express';
import { MovieIDManager } from '../controllers/MovieIDManager';
import { Input } from '../experts/Expert';
import { ForumResponse, RequestMoreInformation } from '../blackboard/Forum';

const router = express.Router();
const movieIDManager = new MovieIDManager();

router.post('/identify', async (req: Request, res: Response) => {
  try {
    const { text, form, audio } = req.body;
    
    // Prepare inputs array
    const inputs: Input[] = [];
    if (text) inputs.push({ type: 'text', data: text });
    if (form) inputs.push({ type: 'form', data: form });
    if (audio) inputs.push({ type: 'audio', data: audio });

    if (inputs.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one input type is required'
      });
    }

    const result = await movieIDManager.handleIdentificationRequest(inputs);

    // Handle different response types
    if ('movieName' in result) {
      // This is a ForumResponse
      const forumResponse = result as ForumResponse;
      res.json({
        status: 'success',
        identifiedMovie: forumResponse.movieName,
        confidence: forumResponse.overallConfidence,
        expertUsed: forumResponse.inputsUsed,
      });
  
    } else {
      // This is a RequestMoreInformation response
      const requestMoreInfo = result as RequestMoreInformation;
      res.status(206).json({
        status: 'partial',
        message: 'More information required',
        suggestions: result.details
      });
    }

  } catch (error) {
    console.error('Identification error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Identification failed'
    });
  }
});

export default router;