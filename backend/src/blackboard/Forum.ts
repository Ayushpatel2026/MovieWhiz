import {
  ForumResponse,
  RequestMoreInformation,
  ExpertResponse,
} from "../types/types";
import { v4 as uuidv4 } from "uuid";

export class Forum {
  /**
   * TODO - Implement a method to evaluate responses and return a final decision
   */
  evaluateResponses(
    responses: ExpertResponse[]
  ): ForumResponse | RequestMoreInformation {
    if (responses.length === 0) {
      return {
        inputsUsed: [],
        details: "No responses from experts.",
      };
    }

    const nonEmptyResponses = responses.filter((res) => res.movieConfidences.length > 0);

    if (nonEmptyResponses.length === 0) {
      return {
        inputsUsed: responses.flatMap((res) => res.expertName),
        details:
          "No expert could identify a movie based on the provided information.",
      };
    } else {
      return {
        responseId: uuidv4(),
        overallConfidence:
          nonEmptyResponses.reduce((sum, res) => sum + res.movieConfidences[0].confidence, 0) /
          nonEmptyResponses.length,
        movieName: nonEmptyResponses[0].movieConfidences[0].movieName, // Assuming the first movie is the most relevant
        timeStamp: Date.now(),
        inputsUsed: nonEmptyResponses.flatMap((res) => res.expertName),
      };
    }
  }
}
