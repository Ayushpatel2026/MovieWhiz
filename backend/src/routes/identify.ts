import express, { Request, Response } from 'express';
import { MovieIDManager } from '../controllers/MovieIDManager';
import { Input } from '../types/types';
import { ForumResponse, RequestMoreInformation } from '../blackboard/Forum';

const router = express.Router();
const movieIDManager = new MovieIDManager();

// TODO - HOW THIS THING HANDLES AUDIO INPUT IN THE POST REQUEST NEEDS TO BE FIGURED OUT

/*
  Endpoint to handle identification requests.
  Endpoint URL: http://{baseURL}}/api/identify
  Method: POST

  Example Request Body:
  {
    "text": "A movie about a young wizard who goes to a magical school.",
    "form": {
      "genre": ["fantasy", "adventure"],
      "director": "Chris Columbus",
      "year": 2001,
      "actors": ["Daniel Radcliffe", "Emma Watson"],
      "characters": ["Harry Potter", "Hermione Granger"],
      "setting": ["Hogwarts"]
    },
    "audio": "base64-audio-string"
  }
*/
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
        suggestions: requestMoreInfo.details
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