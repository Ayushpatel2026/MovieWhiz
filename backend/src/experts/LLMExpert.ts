import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { Expert, ExpertResponse } from './Expert';
import { TextInput } from '../types/types';

export class LLMExpert extends Expert {
  private readonly apiEndpoint: string;

  constructor(blackboard: MovieIDBlackboard) {
    super('LLM Expert', blackboard);
    this.apiEndpoint = process.env.LLM_API_ENDPOINT || '';
  }

  async analyze(input: TextInput): Promise<ExpertResponse> {
    const prompt = this.createPrompt(input);
    const llmResponse = await this.queryLLM(prompt);
    return this.parseResponse(llmResponse);
  }

  private createPrompt(input: TextInput): string {
    return `Identify the movie based on the following text: ${input.data}`;
  }

  private async queryLLM(prompt: string): Promise<string> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200,
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices[0].text.trim();
  }

  /*
   * TODO - Implement a method to parse the LLM response
   * and return an ExpertResponse object
  */
  private parseResponse(llmText: string): ExpertResponse {
    const movies = ["MOVIE"];
    return {
      expertName: this.name,
      movies,
      confidence: this.calculateConfidence(movies, llmText),
      timestamp: Date.now(),
      details: llmText
    };
  }

  /*
   * TODO - implement a more sophisticated confidence calculation
   * based on the LLM response
  */
  public calculateConfidence(matches: string[], llmText: string): number {
    const detailScore = llmText.split('\n').length / 10;
    return Math.min(0 + detailScore, 0.95);
  }
}