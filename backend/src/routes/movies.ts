import express, { Request, Response } from "express";
import { MovieInformationService } from '../services/MovieInformationService';

const router = express.Router();
const movieInformationService = new MovieInformationService();

/*
	GET endpoint to retrieve movie information for a movie name

  Example URL: http://{baseURL}/api/movies/the-matrix
  Example Response:
		{
			"actors": [
					"Keanu Reeves",
					"Carrie-Anne Moss",
					"Laurence Fishburne"
			],
			"characters": [
					"Neo",
					"Trinity",
					"Morpheus",
					"Agent Smith"
			],
			"soundtrack": [
					"Spybreak!"
			],
			"year": 1999,
			"director": "The Wachowskis",
			"genre": [
					"Sci-Fi",
					"Action"
			],
			"title": "The Matrix",
			"setting": [
					"The Matrix",
					"Zion",
					"Dystopian Future"
			]
		}
  Returns a movie object if found.
  Returns a 500 status code if there is an error retrieving the movie information.
*/
router.get("/:title", async (req: Request, res: Response) => {
	const title = req.params.title;
	try {
		console.log("Getting movie from database:", title)
		const movie = await movieInformationService.getMovie(title);
		if (movie){
			return res.json(movie);
		}
		res.json(movie);
	} catch (error) {
		console.error('Error getting user history:', error);
		res.status(500).json({ error: 'Failed to retrieve response history.' });
	}
});

module.exports = router;
