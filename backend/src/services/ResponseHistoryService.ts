import { db } from '../config/firebaseConfig';
import { StoredResponse, ForumResponse } from '../types/types';
import { DocumentReference, DocumentData} from 'firebase-admin/firestore';

export class ResponseHistoryService {
  private responseHistoryCollection = db.collection('responseHistory');

  async storeResponse(userId: string, forumResponse: ForumResponse): Promise<DocumentReference<DocumentData>> {
    const storedResponse: StoredResponse = {
      userId: userId,
      forumResponse: forumResponse,
    };
    return await this.responseHistoryCollection.add(storedResponse);
  }

  // Get all documents where userId matches the provided userId and 
  // order by timeStamp in descending order to show most recent first
  async getUserHistory(userId: string): Promise<StoredResponse[]> {
    console.log("Getting response history for user:", userId);
    const snapshot = await this.responseHistoryCollection.where('userId', '==', userId).orderBy('forumResponse.timeStamp', 'desc').get();
    return snapshot.docs.map(doc => doc.data() as StoredResponse);
  }
}