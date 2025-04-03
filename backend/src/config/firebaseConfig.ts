import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5UI-S2CSQ-kKgWsayBCgqwHJxJoqqFo4",
  authDomain: "moviewhiz-se3a04.firebaseapp.com",
  projectId: "moviewhiz-se3a04",
  storageBucket: "moviewhiz-se3a04.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:626842236267:android:531bbc7cab5c187953882e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
