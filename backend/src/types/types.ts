export type Input = FormInput | TextInput | AudioInput;

export type FormInput = {
	type: "form";
	data: {
		genre?: string[];
		director?: string;
		year?: number;
		actors?: string[];
		characters?: string[];
		setting?: string;
	};
}

export type TextInput = {
	type: "text";
	data: string;
}

// TODO - FIGURE OUT WHAT THE DATA TYPE SHOULD BE HERE
export type AudioInput = {
	type: "audio";
	data: string;
}

export type StoredResponse = {
	userId: string;
	forumResponse : ForumResponse;
}

export type ForumResponse = {
	responseId: string;
	overallConfidence: number;
	movieName: string;
	timestamp: number;
	inputsUsed: string[];
}

export type RequestMoreInformation = {
	inputsUsed: string[];
	details: string;
}

export interface ExpertResponse {
  expertName: string;
  movies: string[];
  confidence: number;
  timestamp?: number;
  details?: String;
}