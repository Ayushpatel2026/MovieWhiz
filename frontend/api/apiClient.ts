import {
  ForumResponse,
  Movie,
  MovieStreamingInfo,
  StoredResponse,
} from "@/types/types";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || "https://moviewhiz.onrender.com/api";

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/*
  Post request to identify a movie based on the given text, form, and audio inputs
*/
export const identifyMovie = async (formData: FormData, idToken : string | null): Promise<any> => {
  try {
    console.log("Form data text:", formData.get("text"));
    console.log("Form data form:", formData.get("form"));
    console.log("Form data audio:", formData.get("file"));
    const response = await axios.post(
      `${API_BASE_URL}/identify/movie`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${idToken}`,
        },
      }
    );
    console.log(
      "Response from server for movie identification:",
      response.data
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending identification request",
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
	Post a new response to the server sending the userId and the response data
  It is important to send the idToken in the header for authentication, even though there is a userId
  because the userId can be spoofed whereas the idToken is signed by Firebase and can be verified by the backend
*/
export const postResponse = async (
  userId: string,
  forumResponse: ForumResponse,
  idToken: string | null
): Promise<void> => {
  try {
    await api.post("/response-history/create", { userId, forumResponse }, {
      headers: {
        "Authorization": `Bearer ${idToken}`, 
      },
    });
  } catch (error: any) {
    console.error(
      "Error posting response:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
	Get the response history from the data for a given userId
*/
export const getResponseHistory = async (
  userId: string,
  idToken: string | null
): Promise<StoredResponse[]> => {
  try {
    console.log("Fetching response history for userId:", userId);
    const response = await api.get(`/response-history/${userId}`, {
      headers: {
        "Authorization": `Bearer ${idToken}`, 
      },
    });
    const history = response.data as StoredResponse[];
    return history;
  } catch (error: any) {
    console.error(
      "Error fetching response history:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
	Get the streaming info for a given movie name
*/
export const getStreamingInfo = async (
  movieName: string,
  idToken: string | null
): Promise<MovieStreamingInfo> => {
  try {
    const response = await api.get(
      `/streaming-links/${movieName.toLowerCase().replace(/\s+/g, "-")}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      }
    );
    const streamingInfo = response.data as MovieStreamingInfo;
    return streamingInfo;
  } catch (error: any) {
    console.error(
      `Error fetching streaming info for ${movieName}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/*
	Get the movie info for a given movie name
*/
export const getMovieInfo = async (title: string, idToken : string | null): Promise<Movie> => {
  try {
    console.log("Getting movie from url:", API_BASE_URL);
    const response = await api.get(
      `/movies/${title.toLowerCase().replace(/\s+/g, "-")}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      }
    );
    const movieInfo = response.data as Movie;
    return movieInfo;
  } catch (error: any) {
    console.error(
      `Error fetching movie info for ${title}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
