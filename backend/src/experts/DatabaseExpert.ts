import { MovieIDBlackboard } from "../blackboard/MovieIDBlackboard";
import { Expert } from "./Expert";
import {
  FormInput,
  ExpertResponse,
  MovieConfidences,
  Movie,
} from "../types/types";
import { FirestoreMovieDatabase } from "./movie-database/FirestoreMovieDatabase";

export class DatabaseExpert extends Expert {

  // this can be changed to any movie database implementation
  private movieDatabase = new FirestoreMovieDatabase();

  constructor(blackboard: MovieIDBlackboard) {
    super("Database Expert", blackboard);
  }

  async analyze(input: FormInput): Promise<ExpertResponse> {
    if (input.type !== "form") {
      throw new Error("Unsupported input type");
    }

    const query = this.buildQuery(
      typeof input.data == "string" ? JSON.parse(input.data).data : input.data
    );
    const matches = await this.movieDatabase.findMatchingMovies(query);

    const movieConfidences = await this.calculateConfidence(matches, query);

    return {
      expertName: this.name,
      movieConfidences: movieConfidences.sort(
        (a, b) => b.confidence - a.confidence
      ),
      timeStamp: Date.now(),
      details: `Query: ${JSON.stringify(query)}, Found ${
        matches.length
      } matches.`,
    };
  }

  /*
    This function builds a query object based on the input data.
    It uses a helper function to sanitize any arrays and strings to ensure that they are in the correct format.
    It also handles optional fields and ensures that the data is in the correct format.
  */
  private buildQuery(data: FormInput["data"]): Record<string, any> {
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid data format for form input");
    }
    return {
      genre:
        data.genre &&
        data.genre.length > 0 &&
        !(data.genre.length == 1 && data.genre[0] == "")
          ? data.genre
          : undefined,
      director: data.director ? data.director : undefined,
      year: data.year ? data.year : undefined,
      actors:
        data.actors &&
        data.actors.length > 0 &&
        !(data.actors.length == 1 && data.actors[0] == "")
          ? data.actors
          : undefined,
      characters:
        data.characters &&
        data.characters.length > 0 &&
        !(data.characters.length == 1 && data.characters[0] == "")
          ? data.characters
          : undefined,
      settings:
        data.settings &&
        data.settings.length > 0 &&
        !(data.settings.length == 1 && data.settings[0] == "")
          ? data.settings
          : undefined,
    };
  }

  /* 
    * This function calculates the confidence of each movie match based on the query and the database.
    * It uses a scoring system to determine how well each movie matches the query, with 100 being a perfect match.
    * The scoring system is based on the following criteria:
    *   1. Only 1 match: 100% confidence
    *   2. Director match: 25% confidence
    *   3. Year match: 15% confidence
    *   4. Actor match: 10% confidence
    *   5. Character match: 15% confidence
    *   6. Genre match: 5% confidence
    *   7. Settings match: 10% confidence
    *   8. Non-unique matches penalties: 5% for each non-unique actor match, 2% for each non-unique genre match, and 5% for each non-unique setting match.
    * The function also applies penalties for results with more than 5 matches, reducing the confidence by up to 50%.
  */
  public async calculateConfidence(
    matches: Movie[],
    query: any
  ): Promise<MovieConfidences[]> {
    const allMovies = await this.movieDatabase.getAllMovies();

    if (matches.length === 1) {
      return matches.map((movie) => ({
        movieName: movie.title || "Unnamed Movie",
        confidence: 100, // Perfect confidence if only one match
      }));
    }

    const movieConfidences: { movieName: string; confidence: number }[] = [];

    // 1. Calculate the frequency of each query term in the entire database
    const actorFrequencies: Record<string, number> = {};
    const genreFrequencies: Record<string, number> = {};
    const settingFrequencies: Record<string, number> = {};

    allMovies.forEach((movie) => {
      query.actors?.forEach((actor: string) => {
        if (
          movie.actors
            ?.map((a) => a.toLowerCase())
            .includes(actor.toLowerCase())
        ) {
          actorFrequencies[actor.toLowerCase()] =
            (actorFrequencies[actor.toLowerCase()] || 0) + 1;
        }
      });
      query.genre?.forEach((genre: string) => {
        if (
          movie.genre?.map((g) => g.toLowerCase()).includes(genre.toLowerCase())
        ) {
          genreFrequencies[genre.toLowerCase()] =
            (genreFrequencies[genre.toLowerCase()] || 0) + 1;
        }
      });
      query.settings?.forEach((setting: string) => {
        if (
          movie.settings
            ?.map((s) => s.toLowerCase())
            .includes(setting.toLowerCase())
        ) {
          settingFrequencies[setting.toLowerCase()] =
            (settingFrequencies[setting.toLowerCase()] || 0) + 1;
        }
      });
    });

    matches.forEach((movie) => {
      let score = 0;
      const maxPossibleScore = 100; // Our target maximum confidence

      // 2. Award initial points for each matching attribute
      if (
        query.director &&
        movie.director?.toLowerCase() === query.director.toLowerCase()
      ) {
        // More points for exact match on director since directors are often more unique
        score += 25;
      }
      if (query.year && movie.year === query.year) {
        // Year is a strong indicator, so give it a decent score
        score += 15;
      }
      query.actors?.forEach((actor: string) => {
        if (
          movie.actors
            ?.map((a: string) => a.toLowerCase())
            .includes(actor.toLowerCase())
        ) {
          // Actors are less unique than directors, so give them a lower score
          score += 10;
        }
      });
      query.characters?.forEach((char: string) => {
        if (
          movie.characters
            ?.map((c: string) => c.toLowerCase())
            .includes(char.toLowerCase())
        ) {
          // Characters are actually quite unique, so give them a higher score
          score += 15;
        }
      });
      query.genre?.forEach((genre: string) => {
        if (
          movie.genre
            ?.map((g: string) => g.toLowerCase())
            .includes(genre.toLowerCase())
        ) {
          // Genres matching is very common, so give them a lower score
          score += 5;
        }
      });
      query.settings?.forEach((setting: string) => {
        // Settings matching is also common, so give them a lower score
        if (
          movie.settings
            ?.map((s: string) => s.toLowerCase())
            .includes(setting.toLowerCase())
        ) {
          score += 10;
        }
      });

      // 3. Apply penalties based on the frequency of matched attributes in the database
      let penalty = 0;
      query.actors?.forEach((actor: String) => {
        if (
          (actorFrequencies[actor.toLowerCase()] || 0) > 1 &&
          movie.actors
            ?.map((a: string) => a.toLowerCase())
            .includes(actor.toLowerCase())
        ) {
          penalty += 5; // Reduce confidence by 5 for each non-unique actor match
        }
      });
      query.genre?.forEach((genre: string) => {
        if (
          (genreFrequencies[genre.toLowerCase()] || 0) > 1 &&
          movie.genre
            ?.map((g: string) => g.toLowerCase())
            .includes(genre.toLowerCase())
        ) {
          penalty += 2; // Reduce confidence by 2 for each non-unique genre match
        }
      });
      query.settings?.forEach((setting: string) => {
        if (
          (settingFrequencies[setting.toLowerCase()] || 0) > 1 &&
          movie.settings
            ?.map((s: string) => s.toLowerCase())
            .includes(setting.toLowerCase())
        ) {
          penalty += 5; // Reduce confidence by 5 for each non-unique setting match
        }
      });

      score -= penalty;

      // 4. Apply a penalty if more than 5 movies were initially returned
      if (matches.length > 5) {
        const numberOfExcessMatches = matches.length - 5;
        const largeMatchPenalty = Math.min(numberOfExcessMatches * 2, 50); // Reduce by up to 50
        score -= largeMatchPenalty;
      }

      // 5. Normalize the score to the 0-100 range and ensure it doesn't go below 0
      const confidence = Math.max(0, Math.min(100, score));

      movieConfidences.push({
        movieName: movie.title || "Unnamed Movie",
        confidence: confidence,
      });
    });

    return movieConfidences;
  }
}
