import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { ExpertResponse, Input, MovieConfidences } from '../types/types';
import { Expert } from './Expert';
import { getLLMProvider } from './llm/LLMProviderRegistry';

export class LLMExpert extends Expert {

  constructor(blackboard: MovieIDBlackboard) {
    super('LLM Expert', blackboard);
  }

  async analyze(input: Input): Promise<ExpertResponse> {
    const prompt = this.createPrompt(input);
    const llmResponse = await this.queryLLM(prompt);
    return this.parseResponse(llmResponse);
  }

  private createPrompt(input: Input): string {
    return `You are an expert movie recommendation engine. I will give you a movie description. Your task is to identify movies based on the description and return a JSON response in the following format:
  
  {
    "movies": [
      {
        "movieName": "Movie Title 1",
        "confidence": 90
      },
      {
        "movieName": "Movie Title 2",
        "confidence": 50
      }
    ]
  }
  
  - "movieName": The name of the movie.
  - "confidence": A number between 0 and 100 (inclusive) representing how confident you are that the movie matches the description. 100 means you are absolutely certain, 0 means you are sure it's not a match.
  
  If no movies are found that match the description, return:
  
  {
    "movies": []
  }
  
  This is the movie description:
  ${input.data}"
  `;
  }
  
  private async queryLLM(prompt: string): Promise<string> {
    const llm_provider = process.env.LLM_PROVIDER;

    if (!llm_provider) {
      throw new Error("LLM provider is not set in the environment variables.");
    }

    const llm = getLLMProvider(llm_provider);

    const response = await llm.generate(prompt);

    return response;
  }

  /*
   * TODO - Implement a method to parse the LLM response
   * and return an ExpertResponse object
  */
  private parseResponse(llmText: string): ExpertResponse {
    try {
      if (process.env.DEBUG_LLM === "true") {
        console.log("LLM raw response:", llmText);
      }

      // Remove markdown code block formatting like ```json or ```
      const cleanedText = llmText
      .replace(/```json\s*/gi, '')  // remove starting ```json
      .replace(/```/g, '')          // remove ending ```
      .trim();                      // trim extra whitespace

      // Attempt to parse the JSON text
      const jsonResponse = JSON.parse(cleanedText);
      //console.log('Parsed JSON response:', jsonResponse);
      if (
        !jsonResponse ||
        !jsonResponse.movies ||
        jsonResponse.movies.length === 0
      ) {
        return {
          expertName: this.name,
          movieConfidences: [],
          timeStamp: Date.now(), // Optional: Add a timeStamp
        };
      }
      
      // Just in case the LLM messes up and does not return movies sorted by confidence
      const sortedMovies = [...jsonResponse.movies].sort(
        (a, b) => b.confidencescore - a.confidencescore
      );
      
      return {
          expertName: this.name,
          movieConfidences: sortedMovies.map(movie => ({
              movieName: movie.movieName,
              confidence: movie.confidence,
          })),
          timeStamp: Date.now(),
      };
  
    } catch (error) {
      console.error("Error parsing JSON:", error);
      // Handle JSON parsing errors gracefully.  Return a default ExpertResponse or throw an error.
      return {
        expertName: this.name,
        movieConfidences: [],
        details: "Error parsing JSON response."
      };
    }
  }

  /*
   * THIS IS NOT NEEDED FOR LLM EXPERT SINCE THE LLM PROVIDES CONFIDENCE SCORES
  */
  public calculateConfidence(llmText: string, matches: string[]): MovieConfidences[] {
    return [];
  }
}