import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";

export interface ExpertResponse {
  expertName: string;
  movies: string[];
  confidence: number;
  timestamp?: number;
  details?: String;
}
  
export abstract class Expert {
  public readonly name: string;
  public blackboard : MovieIDBlackboard;

  constructor(name: string, blackboard: MovieIDBlackboard) {
    this.blackboard = blackboard;
    this.blackboard.subscribe(this);
    this.name = name;
  }

  public abstract analyze(input: Input): Promise<ExpertResponse>;
  public abstract calculateConfidence(matches: string[], query: any): number;
}

export type Input =
  | {
      type: "form";
      data: {
        genre?: string[];
        director?: string;
        year?: number;
        actors?: string[];
        characters?: string[];
        setting?: string;
      };
    }
  | {
      type: "text";
      data: string;
    }
  | {
      type: "audio";
      data: string;
    };