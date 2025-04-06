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
    console.log("Data received for query:", data);
    return {
      genre: data.genre ? this.sanitizeArray(data.genre) : undefined,
      director: data.director ? data.director : undefined,
      year: data.year !== undefined ? data.year : undefined,
      actors: data.actors ? this.sanitizeArray(data.actors) : undefined,
      characters: data.characters ? this.sanitizeArray(data.characters) : undefined,
      setting: data.setting ? data.setting : undefined
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
    
    /* A firestore query can only contain one 'array-contains-any' clause, so we need to handle that separately
      By first running an intermediate query 
    */
    if (query.genre) {
      baseQuery = baseQuery.where('genre', 'array-contains-any', query.genre);
    }
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
    
    // Filter by actors and characters after the initial query
    // makes sure that all the actors in the query are present in the movie's actors array
    if (query.actors) {
      for (const actor of query.actors) {
        intermediateResults = intermediateResults.filter(movie =>
          movie.actors && movie.actors.map((a: string) => a.toLowerCase()).includes(actor.toLowerCase())
        );
      }
      results = intermediateResults;
    } else {
      results = intermediateResults;
    }
    
    // makes sure that all the characters in the query are present in the movie's characters array
    if (query.characters) {
      results = results.filter(movie =>
        query.characters!.every((char : string) =>
          movie.characters && movie.characters.map((c: string) => c.toLowerCase()).includes(char.toLowerCase())
        )
      );
    }
  
    return results;
  }

  /* 
    TDO - FIGURE OUT HOW TO CALCULATE CONFIDENCE
  */
  public calculateConfidence(matches: DocumentData[], query: any): MovieConfidences[] {
    return [];
  }
}