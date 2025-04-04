import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { Expert, ExpertResponse } from './Expert';
import { db } from '../config/firebaseConfig';
import { FormInput } from '../types/types';
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
      movies: matches.map(movie => movie.title), // Return only the titles
      confidence: this.calculateConfidence(matches, query),
      timestamp: Date.now(),
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
      director: data.director ? data.director.trim().toLowerCase() : undefined,
      year: data.year !== undefined ? data.year : undefined,
      actors: data.actors ? this.sanitizeArray(data.actors) : undefined,
      characters: data.characters ? this.sanitizeArray(data.characters) : undefined,
      setting: data.setting ? data.setting.trim().toLowerCase() : undefined
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
    TDO - THE CODE BELOW IS COMPLETELY GPT GENERATED AND NOT SURE IF THIS IS HOW WE WANT TO CALCULATE CONFIDENCE
  */
  public calculateConfidence(matches: DocumentData[], query: any): number {
    // Public method to calculate a confidence score based on the number of matches and the query criteria
    if (matches.length === 0) return 0; // If there are no matches, the confidence is 0

    let confidence = 0;
    const maxPossibleMatches = matches.length; // Initial confidence based on any match

    if (query.director && matches.some(movie => movie.director?.toLowerCase() === query.director)) {
      confidence++;
      // If a director was in the query and at least one of the matched movies has a matching director (case-insensitive), increase confidence
    }
    if (query.year && matches.some(movie => movie.year === query.year)) {
      confidence++;
      // If a year was in the query and at least one of the matched movies has a matching year, increase confidence
    }
    if (query.setting && matches.some(movie => movie.setting?.toLowerCase() === query.setting)) {
      confidence++;
      // If a setting was in the query and at least one of the matched movies has a matching setting (case-insensitive), increase confidence
    }

    let actorMatchCount = 0;
    if (query.actors && query.actors.length > 0) {
      matches.forEach(movie => {
        if (movie.actors && query.actors.every((actor: string) => movie.actors.map((a: string) => a.toLowerCase()).includes(actor))) {
          actorMatchCount++;
          // For each matched movie, check if all the actors in the query are present in the movie's actors array (case-insensitive)
        }
      });
      confidence += actorMatchCount / maxPossibleMatches;
      // Increase confidence based on the proportion of movies that fully match the queried actors
    }

    let characterMatchCount = 0;
    if (query.characters && query.characters.length > 0) {
      matches.forEach(movie => {
        if (movie.characters && query.characters.every((character : string) => movie.characters.map((c: string) => c.toLowerCase()).includes(character))) {
          characterMatchCount++;
          // For each matched movie, check if all the characters in the query are present in the movie's characters array (case-insensitive)
        }
      });
      confidence += characterMatchCount / maxPossibleMatches;
      // Increase confidence based on the proportion of movies that fully match the queried characters
    }

    let genreMatchCount = 0;
    if (query.genre && query.genre.length > 0) {
      matches.forEach(movie => {
        if (movie.genre && query.genre.every((g : string) => movie.genre.map((a: string) => a.toLowerCase()).includes(g))) {
          genreMatchCount++;
          // For each matched movie, check if all the genres in the query are present in the movie's genre array (case-insensitive)
        }
      });
      confidence += genreMatchCount / maxPossibleMatches;
      // Increase confidence based on the proportion of movies that fully match the queried genres
    }

    // Normalize confidence to be between 0 and 1
    const normalizedConfidence = maxPossibleMatches > 0 ? confidence / maxPossibleMatches : 0;
    return Math.min(normalizedConfidence, 1); // Returns the calculated confidence, ensuring it doesn't exceed 1
  }
}
