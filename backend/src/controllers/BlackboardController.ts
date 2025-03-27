import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Forum, ForumResponse, RequestMoreInformation } from "../blackboard/Forum";
import { LLMExpert } from "../experts/LLMExpert";
import { SoundtrackExpert } from "../experts/SoundtrackExpert";
import { DatabaseExpert } from "../experts/DatabaseExpert";
import { Input } from "../experts/Expert";

export class BlackboardController {
  private blackboard: MovieIDBlackboard;
  private forum: Forum;

  constructor() {
    this.blackboard = new MovieIDBlackboard();
    this.forum = new Forum();
    this.setupExperts();
  }

  private setupExperts(): void {
    // Register all expert observers
    new LLMExpert(this.blackboard);
    new SoundtrackExpert(this.blackboard);
    new DatabaseExpert(this.blackboard);
  }

  async identifyMovie(inputs: Input[]): Promise<ForumResponse | RequestMoreInformation> {

    // Submit inputs to blackboard and get responses
    const responses = await this.blackboard.notifyExperts(inputs);
    
    // Get final decision from forum
    return this.forum.evaluateResponses(responses);
  }
}