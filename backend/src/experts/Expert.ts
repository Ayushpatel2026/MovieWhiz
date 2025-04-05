import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Input, ExpertResponse } from "../types/types";

export abstract class Expert {
  public readonly name: string;
  public blackboard: any;

  constructor(name: string, blackboard: MovieIDBlackboard) {
    this.blackboard = blackboard;
    this.blackboard.subscribe(this);
    this.name = name;
  }

  public abstract analyze(input: Input): Promise<ExpertResponse>;
  public abstract calculateConfidence(matches: any, query: any): number;
}
