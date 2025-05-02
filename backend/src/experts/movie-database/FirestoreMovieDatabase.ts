import { db } from "../../config/firebaseConfig";
import { MovieDatabase } from "./MovieDatabase";
import { Movie } from "../../types/types";
import { DocumentData } from "firebase-admin/firestore";

export class FirestoreMovieDatabase implements MovieDatabase {
  async findMatchingMovies(query: Record<string, any>): Promise<Movie[]> {
    let moviesRef = db.collection("movies");
		let baseQuery: FirebaseFirestore.Query = moviesRef;

		if (query.year) {
			baseQuery = baseQuery.where("year", "==", query.year);
		}

		if (query.soundtrack){
			baseQuery = baseQuery.where("soundtracks", "array-contains", query.soundtrack);
		}

		const snapshot = await baseQuery.get();
		let results: DocumentData[] = snapshot.docs.map((doc) => {
			return doc.data();
		});

		if (query.director) {
			results = results.filter((movie) =>
				typeof movie.director === "string" && (movie.director as string).toLowerCase() === query.director.toLowerCase()
			);
		}

		// Every setting in the query must be present in the movie's settings for it to be included in the results
		if (query.settings) {
			results = results.filter(
				(movie) =>
					movie.settings &&
					(typeof movie.settings === "string"
						? [query.settings]
						: query.settings
					).every((setting: string) =>
						(movie.settings as string[]).map(s => s.toLowerCase()).includes(setting.toLowerCase())
					)
			);
		}

		// Every actor in the query must be present in the movie's actors for it to be included in the results
		if (query.actors) {
			results = results.filter(
				(movie) =>
					movie.actors &&
					query.actors!.every((actor: string) =>
						(movie.actors as string[]).map(a => a.toLowerCase()).includes(actor.toLowerCase())
					)
			);
		}

		// Every character in the query must be present in the movie's characters for it to be included in the results
		if (query.characters) {
			results = results.filter(
				(movie) =>
					movie.characters &&
					query.characters!.every((char: string) =>
						(movie.characters as string[]).map(c => c.toLowerCase()).includes(char.toLowerCase())
					)
			);
		}

		// Every genre in the query must be present in the movie's genre for it to be included in the results
		if (query.genre) {
			results = results.filter(
				(movie) =>
					movie.genre &&
					query.genre!.every((genre: string) =>
						(movie.genre as string[]).map(g => g.toLowerCase()).includes(genre.toLowerCase())
					)
			);
		}

		return results as Movie[];
  }

  async getAllMovies(): Promise<Movie[]> {
    const snapshot = await db.collection("movies").get();
    return snapshot.docs.map(doc => doc.data() as Movie);
  }

	async getByTitle(title: string): Promise<Movie | undefined> {
		const doc = await db.collection("movies").doc(title.toLowerCase().replace(/\s+/g, '-')).get();
		if (doc.exists) {
			return doc.data() as Movie;
		}
		return undefined;
	}

}