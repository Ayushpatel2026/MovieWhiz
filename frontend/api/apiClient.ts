import { Movie, MovieStreamingInfo, StoredResponse } from "@/types/types";
import axios from "axios";

const API_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:7000/api";

// Configure axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000, // 15 second timeout
	headers: {
		"Content-Type": "application/json",
	},
})

/*
	Post a new response to the server sending the userId and the response data
*/
export const postResponse = async (userId: string, forumResponse: StoredResponse["forumResponse"]): Promise<void> => {
	try {
	  await api.post("/response-history/create", { userId, forumResponse });
	} catch (error: any) {
	  console.error("Error posting response:", error.response?.data || error.message);
	  throw error;
	}
};

/*
	Get the response history from the data for a given userId
*/
export const getResponseHistory = async (userId: string): Promise<{ history: StoredResponse[] }> => {
  try {
    const response = await api.get(`/response-history/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching response history:", error.response?.data || error.message);
    throw error;
  }
};

/*
	Get the streaming info for a given movie name
*/
export const getStreamingInfo = async (movieName: string): Promise<MovieStreamingInfo> => {
  try {
    const response = await api.get(`/streaming-links/${movieName.toLowerCase().replace(/\s+/g, '-')}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching streaming info for ${movieName}:`, error.response?.data || error.message);
    throw error;
  }
};

/*
	Get the movie info for a given movie name
*/
export const getMovieInfo = async (title: string): Promise<Movie> => {
  try {
    const response = await api.get(`/movies/${title.toLowerCase().replace(/\s+/g, '-')}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching movie info for ${title}:`, error.response?.data || error.message);
    throw error;
  }
};