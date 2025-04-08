import {
  ForumResponse,
  RequestMoreInformation,
  ExpertResponse,
 } from "../types/types";
 import { v4 as uuidv4 } from "uuid";
 
 /*
FORUM ALGORITHM:
    LLM Expert has highest priority, followed by Database Expert, then Soundtrack Expert.
    LLM Expert returns confidence scores with highest confidence first.
    Database Expert returns confidence scores with highest confidence first.
    Soundtrack Expert returns confidence scores depending on the release year of the movie
        with most recent movie = 100, second = 50, third = 33, etc.
    IF LLM EXPERT HAS RETURNED A MOVIE:
        - If the LLM expert only returns 1 movie, usually that movie is the one.
        - If the LLM expert returns multiple movies, the confidence of the first movie has to be at least 20 points higher than the second movie.
        - if the confidence of the first movie is not at least 20 points higher than the second movie, we move to the database expert.
            - if database expert has returned a movie
                - Check if it is with higher confidence than LLM's first movie, we take that one.
                -   else we move to the soundtrack expert.
            - if soundtrack expert has returned a movie with higher confidence than LLM's first movie, we take that one.
                -   else we say require more information
            - else   require more information
    ELSE (LLM EXPERT HAS NOT RETURNED A MOVIE):
        IF DATABASE EXPERT HAS RETURNED A MOVIE:
            - Check if it is with higher confidence than 80, we take that one.
            - else we move to the soundtrack expert.
        IF DATABASE EXPERT HAS NOT RETURNED A MOVIE:
            - IF SOUNDTRACK EXPERT HAS RETURNED A MOVIE:
                - If soundtrack responses.length > 4, return request more info.
                - Otherwise return the first movie, but overall confidence is the average of the response movie confidences.
            - ELSE we say require more information
    IF NO EXPERT HAS RETURNED A MOVIE:
        - We say require more information
*/
 
export class Forum {
  evaluateResponses(
      responses: ExpertResponse[]
  ): ForumResponse | RequestMoreInformation {
      if (responses.length === 0) {
          return {
              inputsUsed: [],
              details: "No responses received from any experts. More information is needed.",
          };
      }

      const nonEmptyResponses = responses.filter(
          (res) => res.movieConfidences && res.movieConfidences.length > 0
      );

      if (nonEmptyResponses.length === 0) {
          return {
              inputsUsed: responses.map((res) => res.expertName),
              details: "None of the experts could identify a movie based on the current information. More information is needed.",
          };
      }

      const llmResponses = nonEmptyResponses.filter(
          (res) => res.expertName === "LLM Expert"
      );
      const dbResponses = nonEmptyResponses.filter(
          (res) => res.expertName === "Database Expert"
      );
      const soundtrackResponses = nonEmptyResponses.filter(
          (res) => res.expertName === "Soundtrack Expert"
      );

      // Function to format the timestamp
      const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}:${month}:${day}:${hours}:${minutes}`;
    };

      // Helper function to get the top movie confidence, handling potential undefined
      const getTopConfidence = (response?: ExpertResponse): { movieName: string; confidence: number } | undefined => {
          if (response && response.movieConfidences.length > 0) {
              // Assuming LLM is already sorted, for others we take the first
              return response.movieConfidences[0];
          }
          return undefined;
      };

      // Check if LLM Expert has returned a movie
      if (llmResponses.length > 0) {
          const llmTop = getTopConfidence(llmResponses[0]);
          if (llmTop) {
              // Check if LLM has only one movie suggestion
              if (llmResponses[0].movieConfidences.length === 1) {
                  return {
                      responseId: uuidv4(),
                      overallConfidence: llmTop.confidence,
                      movieName: llmTop.movieName,
                      timeStamp: formatTimestamp(Date.now()),
                      inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                  };
              // Check if LLM has multiple movie suggestions
              } else if (llmResponses[0].movieConfidences.length > 1) {
                  const llmSecond = llmResponses[0].movieConfidences[1];
                  // Check if the confidence of the first movie is at least 20 points higher than the second movie
                  if (llmTop.confidence >= llmSecond.confidence + 20) {
                      return {
                          responseId: uuidv4(),
                          overallConfidence: llmTop.confidence,
                          movieName: llmTop.movieName,
                          timeStamp: formatTimestamp(Date.now()),
                          inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                      };
                  // if not, we move to the database expert
                  } else {
                      const dbTop = getTopConfidence(dbResponses[0]);
                      // Check if Database Expert has returned a movie with higher confidence than LLM's first movie
                      if (dbTop && dbTop.confidence > llmTop.confidence) {
                          return {
                              responseId: uuidv4(),
                              overallConfidence: dbTop.confidence,
                              movieName: dbTop.movieName,
                              timeStamp: formatTimestamp(Date.now()),
                              inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                          };
                      // if not, we move to the soundtrack expert
                      } else {
                          const soundtrackTop = getTopConfidence(soundtrackResponses[0]);
                          // Check if Soundtrack Expert has returned a movie with higher confidence than LLM's first movie
                          if (soundtrackTop && soundtrackTop.confidence > llmTop.confidence) {
                              return {
                                  responseId: uuidv4(),
                                  overallConfidence: soundtrackTop.confidence,
                                  movieName: soundtrackTop.movieName,
                                  timeStamp: formatTimestamp(Date.now()),
                                  inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                              };
                            // if not, check that soundtrack expert has returned a movie
                          } else if (soundtrackResponses.length > 0) {
                              return {
                                  inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                                  details: "LLM had multiple close suggestions. Soundtrack and Database Experts could not provide accurate match. More information is needed.",
                              };
                          } else {
                              return {
                                  inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                                  details: "LLM had multiple close suggestions. Database Expert could not provide accurate match. More information is needed.",
                              };
                          }
                      }
                  }
              }
          }
      }
      const DB_THRESHOLD = 80;
      // Now we enter the cases where LLM Expert has not returned a movie
      // Check if Database Expert has returned a movie
      if (dbResponses.length > 0) {
          const dbTop = getTopConfidence(dbResponses[0]);
          // Check if Database Expert has returned a movie with high confidence
          // For the DB expert, we don't need to check the other movies, because generally
          // it returns only one movie with high confidence, or a bunch of movies with terrible confidence
          if (dbTop && dbTop.confidence > DB_THRESHOLD) {
              return {
                  responseId: uuidv4(),
                  overallConfidence: dbTop.confidence,
                  movieName: dbTop.movieName,
                  timeStamp: formatTimestamp(Date.now()),
                  inputsUsed: nonEmptyResponses.map((res) => res.expertName),
              };
          }
      }

      // Lastly we check if the soundtrack expert
      if (soundtrackResponses.length > 0) {
        if (soundtrackResponses.length > 4) {
            return {
                inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                details: "Soundtrack Expert could not provide accurate match. More information is needed.",
            };
        } else {
          const soundtrackTop = getTopConfidence(soundtrackResponses[0]);
          if (soundtrackTop) {
              // Calculate the average confidence from all soundtrack responses
              const totalConfidence = soundtrackResponses.reduce(
                  (sum, res) => sum + (res.movieConfidences[0]?.confidence || 0),
                  0
              );
              const overallConfidence = soundtrackResponses.length > 0 ? totalConfidence / soundtrackResponses.length : 0;

              return {
                  responseId: uuidv4(),
                  overallConfidence: overallConfidence,
                  movieName: soundtrackTop.movieName,
                  timeStamp: formatTimestamp(Date.now()),
                  inputsUsed: nonEmptyResponses.map((res) => res.expertName),
              };
          } else {
            return {
                inputsUsed: nonEmptyResponses.map((res) => res.expertName),
                details: "Soundtrack Expert did not provide accurate responses. More information is needed.",
            };
          }
        }
      }

      return {
          inputsUsed: nonEmptyResponses.map((res) => res.expertName),
          details: "No expert coud provide an accurate match. More information is needed.",
      };
  }
}
 
 
 
 