import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { Expert, ExpertResponse, Input } from './Expert';

export class DatabaseExpert extends Expert {
  
	private readonly apiEndpoint: string;

  constructor(blackboard: MovieIDBlackboard) {
    super('Database Expert', blackboard);
    this.apiEndpoint = process.env.IMBD_API_ENDPOINT || '';
  }

  async analyze(input: Input): Promise<ExpertResponse> {

    const query = this.buildQuery(input);
    const matches = await this.queryDatabase(query);

    return {
      expertName: this.name,
      movies: matches,
      confidence: this.calculateConfidence(),
      timestamp: Date.now(),
      details: query
    };
  }

	/*
	 * TODO - Implement a method to build a query object from the inputs
	 */
  private buildQuery(input:Input): any {
    const query: any = {};
    return query;
  }

	/*
	 * TODO - Implement a this method to query a database
	 */
  private async queryDatabase(query: any): Promise<string[]> {
    // Mock database query
    return ["Movie 1", "Movie 2"];
  }

  /**
   * TODO - Implement a more sophisticated confidence calculation
   * 
   */
  public calculateConfidence(): number {
    return 0;
  }
}