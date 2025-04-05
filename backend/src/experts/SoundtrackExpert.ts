import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Expert } from "./Expert";
import { db } from "../config/firebaseConfig";
import { AudioInput, ExpertResponse, MovieConfidences } from "../types/types";

const token = process.env.AUDD_API_TOKEN;

const axios = require("axios");
const FormData = require("form-data");

export type SongData = {
  name: string;
  artist: string;
};

type MovieData = {
  title: string;
  year: number;
};

export class SoundtrackExpert extends Expert {
  constructor(blackboard: MovieIDBlackboard) {
    super("Soundtrack Expert", blackboard);
  }

  async analyze(audioInput: AudioInput): Promise<ExpertResponse> {
    try {
      const song = await this.queryAudioAPI(audioInput.data);
      const movieData: MovieData[] = await this.queryDatabase(song?.name || "");
      // console.log(movieData);
      const movieDataWithScores = this.calculateConfidence(movieData);
      // console.log(movieDataWithScores);

      return {
        expertName: this.name,
        details: song || "song not found",
        movieConfidences: movieDataWithScores,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Audio processing failed:", error);
      return Promise.reject(error);
    }
  }

  private async queryDatabase(songName: string) {
    const moviesRef = db.collection("movies");
    const snapshot = await moviesRef
      .where("soundtracks", "array-contains", songName)
      .get();
    if (snapshot.empty) {
      return [];
    }

    const test = snapshot.docs.map((doc) => {
      return {
        title: doc.data().title,
        year: doc.data().year,
      };
    });
    return test;
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
  public calculateConfidence(movies: MovieData[]): MovieConfidences[] {
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
