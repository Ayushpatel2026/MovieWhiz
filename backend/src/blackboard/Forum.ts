import { ExpertResponse } from "../experts/Expert";
import { Input } from "../types/types";
import { v4 as uuidv4 } from 'uuid';

export type ForumResponse = {
	responseId: string;
	overallConfidence: number;
	movieName: string;
	timestamp: number;
	inputsUsed: string[];
}

export type RequestMoreInformation = {
	inputsUsed: string[];
	details: string;
}

export class Forum {

  /**
	 * TODO - Implement a method to evaluate responses and return a final decision
	 */
  evaluateResponses(responses : ExpertResponse[]): ForumResponse | RequestMoreInformation {
		if (responses.length === 0) {
      return {
        inputsUsed: [],
        details: "No responses from experts."
      };
    }

    const nonEmptyResponses = responses.filter(res => res.movies.length > 0);

    if (nonEmptyResponses.length === 0) {
      return {
        inputsUsed: responses.flatMap(res => res.expertName),
        details: "No expert could identify a movie based on the provided information."
      };
    } else {
			return {
				responseId: uuidv4(),
				overallConfidence: nonEmptyResponses.reduce((sum, res) => sum + res.confidence, 0) / nonEmptyResponses.length,
				movieName: nonEmptyResponses[0].movies[0], // Assuming the first movie is the most relevant
				timestamp: Date.now(),
				inputsUsed: nonEmptyResponses.flatMap(res => res.expertName)
			}
		}
	}
}