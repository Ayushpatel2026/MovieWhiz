import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Input } from "../types/types";

export interface ExpertResponse {
  expertName: string;
  movies: string[];
  confidence: number;
  timestamp?: number;
  details?: String;
}
  
export abstract class Expert {
  public readonly name: string;
  public blackboard : any;

  constructor(name: string, blackboard: MovieIDBlackboard) {
    this.blackboard = blackboard;
    this.blackboard.subscribe(this);
    this.name = name;
  }

  public abstract analyze(input: Input): Promise<ExpertResponse>;
  public abstract calculateConfidence(matches: any, query: any): number;
}
