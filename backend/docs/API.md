# MovieWhiz API Documentation

This documentation covers the RESTful API endpoints available in the MovieWhiz backend service.

## Base URL

All API endpoints are prefixed with: `http://{baseURL}/api`

## Authentication

Most endpoints require authentication using the `isAuthenticated` middleware. Include your authentication token in the request headers as below:

```typescript
    headers: {
        "Authorization": `Bearer ${idToken}`,
    },
```

---

## Table of Contents

- [Movie Identification](#movie-identification)
- [Movie Information](#movie-information)
- [Response History](#response-history)
- [Streaming Links](#streaming-links)

---

## Movie Identification

### Identify a Movie

Processes various inputs to identify a movie based on provided information.

**Endpoint:** `POST /identify/movie`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type        | Required | Description                     |
| --------- | ----------- | -------- | ------------------------------- |
| `text`    | String      | No\*     | Text description of the movie   |
| `form`    | JSON String | No\*     | Structured data about the movie |
| `file`    | File        | No\*     | Audio file related to the movie |

\*At least one of these inputs is required.

**Form JSON Structure:**

```json
{
  "genre": ["fantasy", "adventure"],
  "director": "Chris Columbus",
  "year": 2001,
  "actors": ["Daniel Radcliffe", "Emma Watson"],
  "characters": ["Harry Potter", "Hermione Granger"],
  "settings": ["Hogwarts"]
}
```

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "status": "success",
    "overallConfidence": 95,
    "movieName": "Harry Potter and the Philosopher's Stone",
    "responseId": "resp123",
    "timeStamp": "2025-05-10T12:34:56Z",
    "inputsUsed": ["text", "form"]
  }
  ```

- **Partial Information Response (206 Partial Content):**

  ```json
  {
    "status": "partial",
    "message": "Need more information to identify the movie"
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "status": "error",
    "message": "At least one input type is required"
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "status": "error",
    "message": "Identification failed"
  }
  ```

---

## Movie Information

### Get Movie Details

Retrieves detailed information about a specific movie by its title.

**Endpoint:** `GET /movies/:title`

**Authentication:** Required

**URL Parameters:**

| Parameter | Description                          |
| --------- | ------------------------------------ |
| `title`   | The title of the movie (URL encoded) |

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "actors": ["Keanu Reeves", "Carrie-Anne Moss", "Laurence Fishburne"],
    "characters": ["Neo", "Trinity", "Morpheus", "Agent Smith"],
    "soundtrack": ["Spybreak!"],
    "year": 1999,
    "director": "The Wachowskis",
    "genre": ["Sci-Fi", "Action"],
    "title": "The Matrix",
    "settings": ["The Matrix", "Zion", "Dystopian Future"]
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to retrieve response history."
  }
  ```

---

## Response History

### Store Response History

Stores a movie identification response in the user's history.

**Endpoint:** `POST /response-history/create`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "userId": "user123",
  "forumResponse": {
    "responseId": "response123",
    "overallConfidence": 100,
    "movieName": "Mamma Mia",
    "timeStamp": "2025-04-04",
    "inputsUsed": ["form input"]
  }
}
```

**Responses:**

- **Success Response (201 Created):**

  ```json
  {
    "message": "Response stored successfully."
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "error": "Missing userId or forumResponse in the request body."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to store response."
  }
  ```

### Get User's Response History

Retrieves the history of movie identification responses for a specific user.

**Endpoint:** `GET /response-history/:userId`

**Authentication:** Required

**URL Parameters:**

| Parameter | Description                                  |
| --------- | -------------------------------------------- |
| `userId`  | The ID of the user whose history to retrieve |

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "history": [
      {
        "userId": "user123",
        "forumResponse": {
          "responseId": "response123",
          "overallConfidence": 100,
          "movieName": "Mamma Mia",
          "timeStamp": "2025-04-04",
          "inputsUsed": ["form input"]
        }
      }
      // Additional history entries...
    ]
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to retrieve response history."
  }
  ```

---

## Streaming Links

### Add Streaming Links

Adds or updates streaming links for a specific movie. **Note: This endpoint is intended for internal use only.**

**Endpoint:** `POST /streaming-links/add`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "movieName": "The Matrix",
  "links": [
    {
      "service": "Netflix",
      "url": "https://www.netflix.com/watch/60012345"
    },
    {
      "service": "Amazon Prime",
      "url": "https://www.amazon.com/dp/B000123456"
    }
  ]
}
```

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "message": "Streaming links updated for movie: The Matrix"
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "error": "Missing movieName or links in the request body."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to add/update streaming links."
  }
  ```

### Get Streaming Links

Retrieves streaming service links for a specific movie.

**Endpoint:** `GET /streaming-links/:movieName`

**Authentication:** Required

**URL Parameters:**

| Parameter   | Description                         |
| ----------- | ----------------------------------- |
| `movieName` | The name of the movie (URL encoded) |

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "movieName": "The Matrix",
    "links": [
      {
        "service": "Netflix",
        "url": "https://www.netflix.com/watch/60012345"
      },
      {
        "service": "Amazon Prime",
        "url": "https://www.amazon.com/dp/B000123456"
      }
    ]
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to retrieve streaming links."
  }
  ```

---

## Types

### Input

```typescript
type Input = FormInput | TextInput | AudioInput;

type FormInput = {
  type: "form";
  data: {
    genre?: string[];
    director?: string;
    year?: number;
    actors?: string[];
    characters?: string[];
    settings?: string[];
  };
};

type TextInput = {
  type: "text";
  data: string;
};

type AudioInput = {
  type: "audio";
  data: Express.Multer.File;
};
```

### Movies

```typescript
type Movie = {
  title: string;
  year: number;
  genre: string[];
  director: string;
  actors: string[];
  characters: string[];
  settings: string[];
  soundtracks: string[];
};
```

### ForumResponse

```typescript
type ForumResponse {
  responseId: string;
  overallConfidence: number;
  movieName: string;
  timeStamp: string;
  inputsUsed: string[];
}
```

### RequestMoreInformation

```typescript
type RequestMoreInformation = {
  inputsUsed: string[];
  details: string;
};
```

### StreamingLink

```typescript
type StreamingLink = {
  platform: string; // e.g., "Netflix", "Amazon Prime Video", "Hulu", "Apple TV+"
  link: string; // The actual URL to the movie on the platform
};

type MovieStreamingInfo = {
  movieName: string;
  links: StreamingLink[];
};
```
