import {
  ForumResponse,
  RequestMoreInformation,
  ExpertResponse,
} from "../types/types";
import { v4 as uuidv4 } from "uuid";

export class Forum {
  evaluateResponses(
    responses: ExpertResponse[]
  ): ForumResponse | RequestMoreInformation {
    if (responses.length === 0) {
      return {
        inputsUsed: [],
        details: "No responses from experts.",
      };
    }

    const nonEmptyResponses = responses.filter(
      (res) => res.movieConfidences && res.movieConfidences.length > 0
    );

    if (nonEmptyResponses.length === 0) {
      return {
        inputsUsed: responses.map((res) => res.expertName),
        details:
          "No expert could identify a movie based on the provided information.",
      };
    }

    // weights for each expert type.
    const weightMapping: Record<string, number> = {
      "LLM Expert": 3,
      "Database Expert": 2,
      "Soundtrack Expert": 1,
    };

    //the weighted average confidence.
    let totalWeight = 0;
    let weightedSum = 0;

    nonEmptyResponses.forEach((res) => {
      const weight = weightMapping[res.expertName] || 1;
      weightedSum += res.movieConfidences[0].confidence * weight;
      totalWeight += weight;
    });

    const overallConfidence = weightedSum / totalWeight;

    // Choose the movie name based on expert priority
    let chosenResponse: ExpertResponse;
    const llmResponses = nonEmptyResponses.filter(
      (res) => res.expertName === "LLM Expert"
    );
    if (llmResponses.length > 0) {
      chosenResponse = llmResponses[0];
    } else {
      const dbResponses = nonEmptyResponses.filter(
        (res) => res.expertName === "Database Expert"
      );
      if (dbResponses.length > 0) {
        chosenResponse = dbResponses[0];
      } else {
        chosenResponse = nonEmptyResponses[0];
      }
    }

    return overallConfidence > 50
      ? {
          responseId: uuidv4(),
          overallConfidence: overallConfidence,
          movieName: chosenResponse.movieConfidences[0].movieName,
          timeStamp: Date.now(),
          inputsUsed: nonEmptyResponses.map((res) => res.expertName),
        }
      : {
          inputsUsed: nonEmptyResponses.map((res) => res.expertName),
          details: "Please put more information",
        };
  }
}
