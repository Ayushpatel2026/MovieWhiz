import { Movie } from '../types/types';
import { FirestoreMovieDatabase } from '../experts/movie-database/FirestoreMovieDatabase';

export class MovieInformationService {

  // can easily swap this out for any other movie database implementation
  private movieDatabase = new FirestoreMovieDatabase();

  async getMovie(title: string): Promise<Movie | undefined> {
    return this.movieDatabase.getByTitle(title);
  }
}