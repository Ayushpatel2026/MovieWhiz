// This file contains all the types used in the backend of the application.

import { SongData } from "../experts/SoundtrackExpert";

export type Movie = {
  title: string;
  year: number;
  genre: string[];
  director: string;
  actors: string[];
  characters: string[];
  setting: string;
  soundtracks: string[]; 
}

//------------------------------------------------------------------------
// INPUT TYPES
//------------------------------------------------------------------------

export type Input = FormInput | TextInput | AudioInput;

export type FormInput = {
  type: "form";
  data: {
    genre?: string[];
    director?: string;
    year?: number;
    actors?: string[];
    characters?: string[];
    setting?: string[];
  };
};

export type TextInput = {
  type: "text";
  data: string;
};

export type AudioInput = {
  type: "audio";
  data: Express.Multer.File;
};

//------------------------------------------------------------------------
// RESPONSE TYPES
//------------------------------------------------------------------------

export type StoredResponse = {
  userId: string;
  forumResponse: ForumResponse;
};

export type ForumResponse = {
  responseId: string;
  overallConfidence: number;
  movieName: string;
  timeStamp: number;
  inputsUsed: string[];
};

export type RequestMoreInformation = {
  inputsUsed: string[];
  details: string;
};

export type ExpertResponse = {
  expertName: string;
  movieConfidences: MovieConfidences[];
  timeStamp?: number;
  details?: String | SongData;
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
