// This file is the the frontend version of the same types as the backend

export type Movie = {
  title: string;
  year: number;
  genre: string[];
  director: string;
  actors: string[];
  characters: string[];
  settings: string[];
  soundtracks: string[];
};

//------------------------------------------------------------------------
// INPUT TYPES
//------------------------------------------------------------------------

export type Input = FormInput | TextInput | AudioInput;

export type FormInput = {
  type: "form";
  data: {
    genre?: string[];
    director?: string;
    year?: number | null;
    actors?: string[];
    characters?: string[];
    settings?: string[];
  };
};

export type TextInput = {
  type: "text";
  data: string;
};

// TODO - figure out how to handle audio files in the frontend
export type AudioInput = {
  type: "audio";
  //data: Express.Multer.File;
};

//------------------------------------------------------------------------
// RESPONSE TYPES
//------------------------------------------------------------------------

export type StoredResponse = {
  userId: string;
  forumResponse: ForumResponse;
};

// THE FRONTEND TYPES HAVE A STATUS OF "PARTIAL" OR "SUCCESS"
export type ForumResponse = {
  status: string;
  responseId: string;
  overallConfidence: number;
  movieName: string;
  timeStamp: string;
  inputsUsed: string[];
};

export type RequestMoreInformation = {
  status: string;
  inputsUsed: string[];
  details: string;
};

export type ExpertResponse = {
  expertName: string;
  movieConfidences: MovieConfidences[];
  timeStamp?: number;
  details?: String | SongData;
};

export type SongData = {
  name: string;
  artist: string;
};

export type MovieConfidences = {
  movieName: string;
  confidence: number;
};

//------------------------------------------------------------------------
// STREAMING LINK TYPES
//------------------------------------------------------------------------

export type StreamingLink = {
  platform: string; // e.g., "Netflix", "Amazon Prime Video", "Hulu", "Apple TV+"
  link: string; // The actual URL to the movie on the platform
};

export type MovieStreamingInfo = {
  movieName: string;
  links: StreamingLink[];
};
