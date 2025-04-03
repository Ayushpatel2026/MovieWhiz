import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { Expert, ExpertResponse } from './Expert';
import { FormInput } from '../types/types';

export class DatabaseExpert extends Expert {

  private readonly apiEndpoint: string;

  constructor(blackboard: MovieIDBlackboard) {
    super('Database Expert', blackboard);
    this.apiEndpoint = process.env.IMBD_API_ENDPOINT || '';
  }

  async analyze(input: FormInput): Promise<ExpertResponse> {
    if (input.type !== "form") {
      throw new Error("Unsupported input type");
    }

    const query = this.buildQuery(input.data);
    const matches = await this.queryDatabase(query);

    return {
      expertName: this.name,
      movies: matches,
      confidence: this.calculateConfidence(matches, query),
      timestamp: Date.now(),
      details: `Query: ${JSON.stringify(query)}`
    };
  }

  private buildQuery(data: FormInput["data"]): Record<string, any> {
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid data format for form input");
    }
  
    return {
      genre: data.genre ? this.sanitizeArray(data.genre) : undefined,
      director: data.director ? data.director.trim().toLowerCase() : undefined,
      year: data.year !== undefined ? data.year : undefined,
      actors: data.actors ? this.sanitizeArray(data.actors) : undefined,
      characters: data.characters ? this.sanitizeArray(data.characters) : undefined,
      setting: data.setting ? data.setting.trim().toLowerCase() : undefined
    };
  }
  

  private sanitizeArray(arr: string[]): string[] {
    return Array.from(new Set(arr.map(item => item.trim().toLowerCase())));
  }

  private async queryDatabase(query: any): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });
      
      if (!response.ok) {
        throw new Error(`Database query failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.movies || [];
    } catch (error) {
      console.error("Error querying the database:", error);
      return [];
    }
  }

  public calculateConfidence(matches: string[], query: any): number {
    if (matches.length === 0) return 0;

    let confidence = 1 / matches.length;

    if (query.director && matches.length === 1) confidence += 0.2; 
    if (query.characters && query.characters.length > 1) confidence += 0.1;

    return Math.min(confidence, 1);
  }
}
