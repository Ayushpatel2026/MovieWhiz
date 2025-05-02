import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Expert } from "./Expert";
import { AudioInput, ExpertResponse, MovieConfidences, Movie } from "../types/types";
import { FirestoreMovieDatabase } from "./movie-database/FirestoreMovieDatabase";

const token = process.env.AUDD_API_TOKEN;

const axios = require("axios");
const FormData = require("form-data");

export type SongData = {
  name: string;
  artist: string;
};

export class SoundtrackExpert extends Expert {

  // this can be changed to any movie database implementation
  private movieDatabase = new FirestoreMovieDatabase();

  constructor(blackboard: MovieIDBlackboard) {
    super("Soundtrack Expert", blackboard);
  }

  async analyze(audioInput: AudioInput): Promise<ExpertResponse> {
    try {
      const song = await this.queryAudioAPI(audioInput.data);
      console.log("Song Data:", song);
      let movieDataWithScores : MovieConfidences[] = [];
      
      if (song){
        const movieMatches: Movie[] = await this.movieDatabase.findMatchingMovies({
          soundtrack: song?.name,
        });
        movieDataWithScores = this.calculateConfidence(movieMatches);
      }

      return {
        expertName: this.name,
        details: song || "Song not found",
        movieConfidences: movieDataWithScores,
        timeStamp: Date.now(),
      };
    } catch (error) {
      console.error("Audio processing failed:", error);
      return Promise.reject(error);
    }
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
      const fullTitle = response.data.result.title;
      const artist = response.data.result.artist;

      // Simple attempt to remove "(From ...)"
      const cleanedTitle = fullTitle.replace(/\s\(From.*?\)/i, "");
      console.log("Cleaned Song Name:", cleanedTitle);
      return {
        name: cleanedTitle,
        artist: artist,
      };
    }

    return null;
  }

  /*
    More recent movies will have a high confidence score
    i.e. the most recent will have confidence of 100, the next 50, and then 33, etc.
  */
  public calculateConfidence(movies: Movie[]): MovieConfidences[] {
    const moviesByAscendingYear = movies.sort((a, b) => a.year - b.year);
    const movieCount = movies.length;

    return moviesByAscendingYear.map((movie, idx) => {
      return {
        movieName: movie.title,
        confidence: 100 / (movieCount - idx),
      };
    });
  }
}
