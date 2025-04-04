import express, { Request, Response } from 'express';
import { ResponseHistoryService } from '../services/ResponseHistoryService';
import { ForumResponse } from '../types/types';

const router = express.Router();
const responseHistoryService = new ResponseHistoryService();

/*
	Route to store a response history entry.

	Example URL: http://{baseURL}/api/response-history/create

	Example Request Body:
	{
		"userId": "user123",
		"forumResponse": {
			"responseId": "response123",
			"overallConfidence": 100,
			"movieName": "Mamma Mia",
			"timeStamp": "2025-04-04",
			"inputsUsed": ["form input"]
		}
	}

	Returns a 201 status code on success and a 400 status code if the request body is missing required fields.
	Returns a 500 status code if there is an error storing the response.
*/
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { userId, forumResponse } = req.body;
    if (!userId || !forumResponse) {
      return res.status(400).json({ error: 'Missing userId or forumResponse in the request body.' });
    }
    await responseHistoryService.storeResponse(userId, forumResponse as ForumResponse);
    res.status(201).json({ message: 'Response stored successfully.' });
  } catch (error) {
    console.error('Error storing response:', error);
    res.status(500).json({ error: 'Failed to store response.' });
  }
});

/*
	Route to get the response history by userId, (this should require authentication middle ware but this is just a prototype)

	Example URL: http://{baseURL}/api/response-history/{userId}

	Returns a list of stored responses for the specified userId.
	Returns a 404 status code if the userId is not found.
	Returns a 500 status code if there is an error retrieving the response history.

	Example Response:
	{
		"history": [
			{
				"userId": "user123",
				"forumResponse": {
					"responseId": "response123",
					"overallConfidence": 100,
					"movieName": "Mamma Mia",
					"timeStamp": "2025-04-04",
					"inputsUsed": ["form input"]
				}
			},
			// ... more responses
		]
	}
*/
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const history = await responseHistoryService.getUserHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error getting user history:', error);
    res.status(500).json({ error: 'Failed to retrieve response history.' });
  }
});

module.exports = router;