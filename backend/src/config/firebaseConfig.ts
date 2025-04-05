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
//     await db.collection("movies").doc(movie.title.toLowerCase().replace(/\s+/g, '-')).set(movie, { merge: true });
//   }
// })();

// const movieStreamingInfo = JSON.parse(fs.readFileSync("src/data/movieStreamingInfo.json", "utf-8"));
// const movieStreamingInfo_counter = movieStreamingInfo.length;
// console.log(`Seeding ${movieStreamingInfo_counter} movies with streaming info...`);

// (async () => {
//   for (const movie of movieStreamingInfo) {
//     await db.collection("movieStreamingInfo").doc(movie.movieName.toLowerCase().replace(/\s+/g, '-')).set(movie, { merge: true });
//   }
// })();