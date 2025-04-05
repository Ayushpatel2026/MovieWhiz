import { db } from '../config/firebaseConfig';
import { MovieStreamingInfo, StreamingLink } from '../types/types';

export class StreamingLinksService {
  private streamingLinksCollection = db.collection('movieStreamingInfo');

  async addStreamingLinks(movieName: string, links: StreamingLink[]): Promise<FirebaseFirestore.WriteResult> {
    const streamingLinksDoc: MovieStreamingInfo = {
      movieName: movieName,
      links: links,
    };

    // Using movieName as document ID (lowercase and hyphenated for safety)
    // merge: true will update if it exists, otherwise create
    return await this.streamingLinksCollection.doc(movieName.toLowerCase().replace(/\s+/g, '-')).set(streamingLinksDoc, { merge: true });
  }

  async getStreamingLinks(movieName: string): Promise<MovieStreamingInfo | undefined> {
    const doc = await this.streamingLinksCollection.doc(movieName.toLowerCase().replace(/\s+/g, '-')).get();
    if (doc.exists) {
      return doc.data() as MovieStreamingInfo;
    }
    return undefined;
  }
}