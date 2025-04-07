import {
  ForumResponse,
  Movie,
  MovieStreamingInfo,
  StoredResponse,
} from "@/types/types";
import axios from "axios";

const API_BASE_URL =
  process.env.BACKEND_BASE_URL || "http://172.17.128.65:7000/api";

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
export const identifyMovie = async (formData: FormData): Promise<any> => {
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
*/
export const postResponse = async (
  userId: string,
  forumResponse: ForumResponse
): Promise<void> => {
  try {
    await api.post("/response-history/create", { userId, forumResponse });
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
  userId: string
): Promise<StoredResponse[]> => {
  try {
    console.log("Fetching response history for userId:", userId);
    const response = await api.get(`/response-history/${userId}`);
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
  movieName: string
): Promise<MovieStreamingInfo> => {
  try {
    const response = await api.get(
      `/streaming-links/${movieName.toLowerCase().replace(/\s+/g, "-")}`
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
export const getMovieInfo = async (title: string): Promise<Movie> => {
  try {
    console.log("Getting movie from url:", API_BASE_URL);
    const response = await api.get(
      `/movies/${title.toLowerCase().replace(/\s+/g, "-")}`
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
