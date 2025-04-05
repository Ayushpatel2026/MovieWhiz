import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = getFirestore(admin.app());

//------------------------------------------------------
// THE CODE BELOW IS FOR SEEDING THE DATABASE WITH MOVIE DATA
// UNCOMMENT TO SEED THE DATABASE WITH MORE MOVIE DATA
//------------------------------------------------------

// const fs = require('fs');

// const movies = JSON.parse(fs.readFileSync("src/data/movies.json", "utf-8"));
// const movie_counter = movies.length;
// console.log(`Seeding ${movie_counter} movies...`);

// (async () => {
//   for (const movie of movies) {
//     const existing = await db.collection("movies")
//       .where("title", "==", movie.title)
//       .get();

//     if (!existing.empty) {
//       const docId = existing.docs[0].id;
//       await db.collection("movies").doc(docId).update(movie);
//       console.log(`🔁 Updated existing movie: ${movie.title}`);
//     } else {
//       await db.collection("movies").add(movie);
//       console.log(`✅ Added new movie: ${movie.title}`);
//     }
//   }
// })();