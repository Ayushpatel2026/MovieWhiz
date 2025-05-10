# MovieWhiz Backend

The MovieWhiz backend is built with Express.js and TypeScript, providing the API infrastructure for the MovieWhiz mobile application. This service powers the movie identification system using a blackboard architecture that coordinates multiple expert systems.

## Core Features

- **Movie Identification API**: Processes multiple input types (text descriptions, form data, and soundtrack audio) to identify forgotten movies
- **Expert Systems**:
  - LLM Expert: Uses Gemini-2.0-flash to identify movies from text descriptions
  - Database Expert: Cross-references structured form data with our movie database
  - Soundtrack Expert: Integrates with Audd.io API to identify movies from soundtrack clips
- **Forum Algorithm**: Combines results from different experts to determine the most accurate movie match
- **Response History**: Tracks and retrieves user identification history
- **Movie Information**: Provides comprehensive details about identified movies
- **Streaming Links**: Offers links to available streaming services for each movie

## Architecture

The backend implements a blackboard architectural pattern with a subscribe-notify pattern, allowing different expert systems to contribute to the movie identification process independently. This design makes the system highly extensible allowing new expert systems to be easily added by extending the `Expert` abstract class.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: Google Cloud Firestore
- **Authentication**: Firebase Authentication
- **External APIs**: Gemini API (LLM), Audd.io API (soundtrack recognition)
- **Testing**: Jest and Supertest
- **Deployment**: Render cloud platform

## Documentation

- [API Documentation](./docs/API.md) - Complete reference for all backend endpoints

---

## Running the backend locally

1.  **Install Dependencies:** Install the required Node.js packages:

    ```bash
    npm install
    ```

2.  **Set Environment Variables:** You need to configure the following environment variables.

    - Create a `.env` file in the backend directory and add the following:

      ```
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      LLM_PROVIDER=gemini
      AUDD_API_TOKEN=YOUR_AUDD_API_TOKEN
      FIREBASE_SERVICE_ACCOUNT_KEY='{ "type": "...", ... , "private_key": "..." }' # Paste the entire JSON string on one line
      ```

    - **Explanation of Variables:**

      - `LLM_PROVIDER`: The LLM Expert uses this variable to switch between different LLM Providers. I have used the Gemini LLM and the Gemini API key below, but you may choose to use any other LLM Provider by extending the `LLMProvider` interface.
      - `GEMINI_API_KEY`: If you choose to use GEMINI - Obtain this from the Google Cloud Console. Otherwise you can use any LLM provider by extending the `LLMProvider` interface and obtaining the appropriate API key.
      - `AUDD_API_TOKEN`: Your API token for the Audd.io music recognition service.
      - `FIREBASE_SERVICE_ACCOUNT_KEY`: The JSON service account key from your Firebase project. This key is necessary for the backend to interact with Firebase services (like Firestore). **Important:** Ensure you paste the entire JSON content of the key file into the `.env` file **on a single line**.

3.  **Run the Backend:** Start the backend server in development mode:

    ```bash
    npm run dev
    ```

    The backend server will typically start on `http://localhost:7000` (or a similar port). Check the console output for the exact URL.

    **Important Note:** If you choose to run the backend locally instead of using the currently deployed version, you will need to manually populate your Firestore database with the movie data that the application relies on. The local backend will not automatically have this data. This data can be found in the `backend/src/data/` folder and can be populated to your database by uncommenting the code in `backend/config/firebaseConfig.ts`

## Running the tests

The tests were written using Jest and Supertest in order to send HTTP requests to the backend API's.

These tests are quite broad and do not use mocks for any core services except for the authentication middleware. As such, you will need to create a `.env.test` and configure the following environment variables:

1.  **Set environment variables:**

    - Create a `.env` file in the backend directory and add the following:

    ```
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      LLM_PROVIDER=gemini
      AUDD_API_TOKEN=YOUR_AUDD_API_TOKEN
      FIREBASE_SERVICE_ACCOUNT_KEY='{ "type": "...", ... , "private_key": "..." }' # Paste the entire JSON string on one line
    ```

2.  **Running the tests:**

- Execute the tests using npm:

  ```
  npm test
  ```

- OR for greater control while developing the tests, use:

  ```
  npm test:watch
  ```
