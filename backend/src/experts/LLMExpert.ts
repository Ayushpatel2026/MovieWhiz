import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { ExpertResponse, Input } from "../types/types";
import { Expert } from "./Expert";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class LLMExpert extends Expert {
  private readonly apiEndpoint: string;

  constructor(blackboard: MovieIDBlackboard) {
    super("LLM Expert", blackboard);
    this.apiEndpoint = process.env.LLM_API_ENDPOINT || "";
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
        "title": "Movie Title 1",
        "confidencescore": 9.0
      },
      {
        "title": "Movie Title 2",
        "confidencescore": 7.5
      }
    ]
  }
  
  - "title": The name of the movie.
  - "confidencescore": A number between 0 and 10 (inclusive) representing how confident you are that the movie matches the description. 10 means you are absolutely certain, 0 means you are sure it's not a match.
  
  If no movies are found that match the description, return:
  
  {
    "movies": []
  }
  
  This is the movie description:
  "A movie that has animals and the main character is a bunny who is a police officer. ${input.data}"
  `;
  }

  private async queryLLM(prompt: string): Promise<string> {
    const llm_provider = process.env.LLM_PROVIDER || "gemini";

    let result: any = "";

    if (llm_provider === "gemini") {
      const API_KEY = process.env.GEMINI_API_KEY || "";
      const genAI = new GoogleGenerativeAI(API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: [],
        responseMimeType: "text/plain",
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      result = await chatSession.sendMessage(prompt);
    } else {
      result = "There has been an error. Try again";
    }

    return result.response.text();
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

      // Attempt to parse the JSON text
      const jsonResponse = JSON.parse(llmText);

      if (
        !jsonResponse ||
        !jsonResponse.movies ||
        jsonResponse.movies.length === 0
      ) {
        return {
          expertName: this.name,
          movies: [],
          confidence: 0,
          timestamp: Date.now(), // Optional: Add a timestamp
        };
      }

      // Find the movie with the highest confidence score
      let bestMovie = jsonResponse.movies[0];
      for (let i = 1; i < jsonResponse.movies.length; i++) {
        if (
          jsonResponse.movies[i].confidencescore > bestMovie.confidencescore
        ) {
          bestMovie = jsonResponse.movies[i];
        }
      }

      return {
        expertName: this.name,
        movies: [bestMovie.title],
        confidence: bestMovie.confidencescore,
        timestamp: Date.now(), // Optional: Add a timestamp
        //details: "Optional details string", // Optional: Add details if needed.
      };
    } catch (error) {
      console.error("Error parsing JSON:", error);
      // Handle JSON parsing errors gracefully.  Return a default ExpertResponse or throw an error.
      return {
        expertName: this.name,
        movies: [],
        confidence: 0,
        details: "Error parsing JSON response.",
      };
    }
  }

  /*
   * TODO - implement a more sophisticated confidence calculation
   * based on the LLM response
   */
  public calculateConfidence(llmText: string, matches: string[]): number {
    const detailScore = llmText.split("\n").length / 10;
    return Math.min(0 + detailScore, 0.95);
  }
}
