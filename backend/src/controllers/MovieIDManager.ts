import { BlackboardController } from "./BlackboardController";
import { Input, ForumResponse, RequestMoreInformation } from "../types/types";

export class MovieIDManager {
  private controller: BlackboardController;

  constructor() {
    this.controller = new BlackboardController();
  }

  async handleIdentificationRequest(inputs: Input[]): Promise<ForumResponse | RequestMoreInformation> {
    try {
			// Maybe some input process/validation here
      const results = await this.controller.identifyMovie(inputs);
      console.log("Results from identification:", results);
      return results;
    } catch (error) {
      console.error("Identification failed:", error);
      throw new Error("Failed to identify movie");
    }
  }
}