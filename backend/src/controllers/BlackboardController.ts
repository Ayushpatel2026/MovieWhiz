import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Forum, ForumResponse, RequestMoreInformation } from "../blackboard/Forum";
import { LLMExpert } from "../experts/LLMExpert";
import { SoundtrackExpert } from "../experts/SoundtrackExpert";
import { DatabaseExpert } from "../experts/DatabaseExpert";
import { Input } from "../types/types";

export class BlackboardController {
  private blackboard: MovieIDBlackboard;
  private forum: Forum;

  constructor() {
    this.blackboard = new MovieIDBlackboard();
    this.forum = new Forum();
    this.setupExperts();
  }

  // the constructor of each expert will register itself to the blackboard
  private setupExperts(): void {
    // Register all expert observers
    new LLMExpert(this.blackboard);
    new SoundtrackExpert(this.blackboard);
    new DatabaseExpert(this.blackboard);
  }

  async identifyMovie(inputs: Input[]): Promise<ForumResponse | RequestMoreInformation> {

    console.log("Inputs received for identification:", inputs);
    // Submit inputs to blackboard and get responses
    const responses = await this.blackboard.notifyExperts(inputs);

    console.log("Responses from experts:", responses);
    
    // Get final decision from forum
    return this.forum.evaluateResponses(responses);
  }
}