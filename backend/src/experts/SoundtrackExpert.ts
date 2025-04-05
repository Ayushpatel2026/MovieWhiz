import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Expert } from "./Expert";
import { AudioInput, ExpertResponse } from "../types/types";

const token = process.env.AUDD_API_TOKEN;

const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

export type SongData = {
  name: string;
  artist: string;
};

export class SoundtrackExpert extends Expert {
  private readonly databaseAPIEndpoint: string;
  private readonly audioAPIEndpoint: string;

  constructor(blackboard: MovieIDBlackboard) {
    super("Soundtrack Expert", blackboard);
    this.audioAPIEndpoint = process.env.AUDIO_API_ENDPOINT || "";
    this.databaseAPIEndpoint = process.env.IMBD_API_ENDPOINT || "";
  }

  async analyze(audioInput: AudioInput): Promise<ExpertResponse> {
    try {
      const song = await this.queryAudioAPI(audioInput.data);

      const movieMatches = await this.queryDatabase(song);

      return {
        expertName: this.name,
        details: song || "song not found",
        movies: movieMatches,
        confidence: this.calculateConfidence(),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Audio processing failed:", error);
      return Promise.reject(error);
    }
  }

  /*
   * TODO - Implement a this method to query a database
   */
  private async queryDatabase(query: any): Promise<string[]> {
    // Mock database query
    return ["Movie 1", "Movie 2"];
  }

  private async queryAudioAPI(
    audioFile: Express.Multer.File
  ): Promise<SongData | null> {
    const form = new FormData();
    form.append("api_token", token);
    form.append("file", audioFile.buffer, audioFile.originalname);

    const response = await axios.post("https://api.audd.io/", form, {
      headers: form.getHeaders,
    });

    if (response.data.status == "success") {
      return {
        name: response.data.result.title,
        artist: response.data.result.artist,
      };
    }

    return null;
  }

  /*
   * TODO - Implement an algorithm to calculate the confidence score
   */
  public calculateConfidence(): number {
    return 0;
  }
}
