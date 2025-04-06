import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { Expert } from './Expert';
import { db } from '../config/firebaseConfig';
import { FormInput, ExpertResponse, MovieConfidences } from '../types/types';
import { DocumentData } from 'firebase-admin/firestore';

export class DatabaseExpert extends Expert {

  constructor(blackboard: MovieIDBlackboard) {
    super('Database Expert', blackboard);
  }

  async analyze(input: FormInput): Promise<ExpertResponse> {
    if (input.type !== "form") {
      throw new Error("Unsupported input type");
    }

    const query = this.buildQuery(input.data);
    const matches = await this.queryDatabase(query);

    console.log("Matches found:", matches);

    return {
      expertName: this.name,
      movieConfidences: this.calculateConfidence(matches, query),
      timeStamp: Date.now(),
      details: `Query: ${JSON.stringify(query)}, Found ${matches.length} matches.`
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
    //console.log("Data received for query:", data);
    return {
      genre: data.genre ? this.sanitizeArray(data.genre) : undefined,
      director: data.director ? data.director : undefined,
      year: data.year !== undefined ? data.year : undefined,
      actors: data.actors ? this.sanitizeArray(data.actors) : undefined,
      characters: data.characters ? this.sanitizeArray(data.characters) : undefined,
      setting: data.setting !== undefined ? data.setting : undefined
    };
  }

  /*
    This is a helper function for the buildQuery function.
    It sanitizes the input array by trimming whitespace and converting to lowercase.
    It also removes duplicates by converting the array to a Set and back to an array.
  */
  private sanitizeArray(arr: string[]): string[] {
    return Array.from(new Set(arr.map(item => item.trim().toLowerCase())));
  }

  /*
    TODO - THIS QUERY STUFF DOES NOT WORK YET
  */

  async queryDatabase(query: any): Promise<DocumentData[]> {
    let moviesRef = db.collection('movies');
    let baseQuery: FirebaseFirestore.Query = moviesRef;
    let results: DocumentData[] = [];
  
    if (query.director) {
      baseQuery = baseQuery.where('director', '==', query.director);
    }
    if (query.year) {
      baseQuery = baseQuery.where('year', '==', query.year);
    }
    if (query.setting) {
      baseQuery = baseQuery.where('setting', '==', query.setting);
    }
  
    let intermediateResults: DocumentData[] = (await baseQuery.get()).docs.map(doc => doc.data());
  
    if (query.actors) {
      intermediateResults = intermediateResults.filter(movie =>
        movie.actors && movie.actors.some((actor: string) =>
          query.actors!.map((a: string) => a.toLowerCase()).includes(actor.toLowerCase())
        )
      );
    }
  
    if (query.characters) {
      intermediateResults = intermediateResults.filter(movie =>
        movie.characters && movie.characters.some((char: string) =>
          query.characters!.map((c: string) => c.toLowerCase()).includes(char.toLowerCase())
        )
      );
    }

    if (query.genre) {
      intermediateResults = intermediateResults.filter(movie =>
        movie.genre && movie.genre.some((char: string) =>
          query.genre!.map((c: string) => c.toLowerCase()).includes(char.toLowerCase())
        )
      );
    }
  
    results = intermediateResults;
  
    return results;
  }
  

  /* 
    TDO - FIGURE OUT HOW TO CALCULATE CONFIDENCE
  */
  public calculateConfidence(matches: DocumentData[], query: any): MovieConfidences[] {
    return matches.map(movie => {
      let score = 0;
      const toLowerArray = (arr: string[]) => arr.map(str => str.toLowerCase());

      if (query.characters && movie.characters && movie.characters.length > 0) {
        const inputChars = toLowerArray(query.characters);
        const movieChars = toLowerArray(movie.characters);
        const matches = inputChars.filter(char => movieChars.includes(char));
        score += matches.length / movieChars.length -0.1;
      }

      if (query.genre && movie.genre && movie.genre.length > 0) {
        const inputGenres = toLowerArray(query.genre);
        const movieGenres = toLowerArray(movie.genre);
        const matches = inputGenres.filter(genre => movieGenres.includes(genre));
        score += matches.length / movieGenres.length - 0.1;
      }

      if (query.actors && movie.actors && movie.actors.length > 0) {
        const inputActors = toLowerArray(query.actors);
        const movieActors = toLowerArray(movie.actors);
        const matches = inputActors.filter(actor => movieActors.includes(actor));
        score += matches.length / movieActors.length - 0.1;
      }

      if (query.director && movie.director) {
        if (query.director.toLowerCase() === movie.director.toLowerCase()) {
          score += 0.1;
        }
      }

      if (query.year && movie.year) {
        if (query.year === movie.year) {
          score += 0.05;
        }
      }

      if (query.setting && movie.setting && movie.setting.length > 0) {
        const inputSetting = toLowerArray(query.setting);
        const movieSetting = toLowerArray(movie.setting);
        const matches = inputSetting.filter(setting => movieSetting.includes(setting));
        score += matches.length / movieSetting.length - 0.1;
      }

      score = Math.min(score, 1.0);

      return {
        movieName: movie.title || "Unnamed Movie", 
        confidence: parseFloat(score.toFixed(2))   
      };
    });
  }
}