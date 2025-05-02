import { Movie } from "../../types/types";

/*
	This interface defines the methods that a movie database should implement.
	It allows for different implementations of movie databases (e.g., Firestore, SQL, iMDB, other APIs etc..)
	to be used interchangeably in the application.
*/
export interface MovieDatabase {
  findMatchingMovies(query: Record<string, any>): Promise<Movie[]>;
  getAllMovies(): Promise<Movie[]>;
	getByTitle(title: string): Promise<Movie | undefined>;
}