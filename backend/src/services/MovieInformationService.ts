import { db } from '../config/firebaseConfig';
import { Movie } from '../types/types';

export class MovieInformationService {
  private streamingLinksCollection = db.collection('movies');

  async getMovie(title: string): Promise<Movie | undefined> {
    const doc = await this.streamingLinksCollection.doc(title.toLowerCase().replace(/\s+/g, '-')).get();
    if (doc.exists) {
      return doc.data() as Movie;
    }
    return undefined;
  }
}