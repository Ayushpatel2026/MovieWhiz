import { ExpertResponse } from "../experts/Expert";
import { Input } from "../types/types";

export type ForumResponse = {
	responseId: string;
	overallConfidence: number;
	movieName: String;
	timestamp: number;
	inputsUsed: Input[];
}

export type RequestMoreInformation = {
	inputsUsed: Input[];
	details: string;
}

export class Forum {

  /**
	 * TODO - Implement a method to evaluate responses and return a final decision
	 */
  evaluateResponses(responses : ExpertResponse[]): ForumResponse | RequestMoreInformation {
		return {
			responseId: "1",
			overallConfidence: 0,
			movieName: "Movie 1",
			timestamp: Date.now(),
			inputsUsed: []
		};
	}
}