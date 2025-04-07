import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { DocumentPickerResponse } from "react-native-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { identifyMovie, postResponse } from "../../api/apiClient";
import { router, useLocalSearchParams } from "expo-router";
import {
  FormInput,
  ForumResponse,
  RequestMoreInformation,
} from "@/types/types";
import { pickAudioFile } from "@/utils/filePicker";

const IdentifyMovieScreen = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [textInput, setTextInput] = useState("");
  const [formState, setFormState] = useState<FormInput>({
    type: "form",
    data: {
      director: "",
      year: null,
      settings: [],
      genre: [],
      actors: [],
      characters: [],
    },
  });
  const [pickedAudio, setPickedAudio] = useState<DocumentPickerResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<
    ForumResponse | RequestMoreInformation | null
  >(null);

  const [settings, setSettings] = useState<string>("");
  const [genres, setGenres] = useState<string>("");
  const [actors, setActors] = useState<string>("");
  const [characters, setCharacters] = useState<string>("");

  const handlePickAudio = async () => {
    const pickedAudio: DocumentPickerResponse | null = await pickAudioFile();
    if (pickedAudio) {
      setPickedAudio(pickedAudio);
    } else {
      setErrorMessage("Failed to pick audio file.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIdentificationResult(null);

    console.log(!!formState);

    try {
      const formData = new FormData();
      let hasData = false; // Track if any data is appended

      if (textInput) {
        hasData = true;
        formData.append("text", textInput);
      }
      if (
        formState.data.director ||
        formState.data.year ||
        (formState.data.settings && formState.data.settings.length > 0) ||
        (formState.data.genre && formState.data.genre.length > 0) ||
        (formState.data.actors && formState.data.actors.length > 0) ||
        (formState.data.characters && formState.data.characters.length > 0)
      ) {
        if (formState) {
          hasData = true;
          formData.append("form", JSON.stringify(formState));
        }
      }
      if (pickedAudio) {
        hasData = true;
        const file = {
          uri: pickedAudio.uri,
          name: pickedAudio.name,
          type: pickedAudio.type,
        };
        formData.append("file", file as any);
      }
      if (!hasData) {
        setErrorMessage(
          "Please provide at least one input (text, form details, or audio)."
        );
        setLoading(false);
        return;
      }
      console.log("Form data before sending:", formData);
      const result = await identifyMovie(formData);
      console.log("Identification result:", result);
      setLoading(false);
      if (result.status === "success") {
        // Store the response
        await postResponse(userId, result);

        const pathName = "/movie-info";
        const params = { movieTitle: result.movieName };
        router.push({
          pathname: pathName,
          params,
        });
      } else if (result.status === "partial") {
        Alert.alert(
          "Please put more info, consider using: " +
            (result.inputsUsed.includes("Database Expert")
              ? ""
              : "Form Input, ") +
            (result.inputsUsed.includes("LLM Expert") ? "" : "Text Input, ") +
            (result.inputsUsed.includes("Soundtrack Expert")
              ? ""
              : "Audio Input")
        );
        setIdentificationResult({
          status: result.status,
          inputsUsed: result.inputsUsed,
          details: result.suggestions,
        });
      } else {
        setErrorMessage(result.message || "Failed to identify movie.");
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Error during identification:", error.message);
      setErrorMessage("Failed to send identification request.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Identify Movie</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Describe the movie:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., A movie about a wizard boy..."
          value={textInput}
          onChangeText={setTextInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Provide more details:</Text>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Director</Text>
          <TextInput
            style={styles.formInput}
            value={formState.data.director}
            onChangeText={(value) => {
              setFormState({
                ...formState,
                data: { ...formState.data, director: value },
              });
              console.log(formState);
            }}
            placeholder="Eg. George Lucas"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Year</Text>
          <TextInput
            style={styles.formInput}
            value={!formState.data.year ? "" : formState.data.year?.toString()}
            onChangeText={(value) => {
              setFormState({
                ...formState,
                data: { ...formState.data, year: parseInt(value) },
              });
              console.log(formState);
            }}
            keyboardType="numeric"
            placeholder="Eg. 1977"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Setting(s)</Text>
          <TextInput
            style={styles.formInput}
            value={settings}
            onChangeText={(value) => {
              setSettings(value);
              setFormState({
                ...formState,
                data: {
                  ...formState.data,
                  settings: value.split(",").map((setting) => setting.trim()),
                },
              });
              console.log(formState);
            }}
            placeholder="Eg. Death Star"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Genre(s)</Text>
          <TextInput
            style={styles.formInput}
            value={genres}
            onChangeText={(value) => {
              setGenres(value);
              setFormState({
                ...formState,
                data: {
                  ...formState.data,
                  genre: value.split(",").map((genre) => genre.trim()),
                },
              });
              console.log(formState);
            }}
            placeholder="Eg. Action, Fantasy"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Actor(s)</Text>
          <TextInput
            style={styles.formInput}
            value={actors}
            onChangeText={(value) => {
              setActors(value);
              setFormState({
                ...formState,
                data: {
                  ...formState.data,
                  actors: value.split(",").map((actor) => actor.trim()),
                },
              });
              console.log(formState);
            }}
            placeholder="Eg. Mark Hamill, Carrie Fisher"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Character(s)</Text>
          <TextInput
            style={styles.formInput}
            value={characters}
            onChangeText={(value) => {
              setCharacters(value);
              setFormState({
                ...formState,
                data: {
                  ...formState.data,
                  characters: value
                    .split(",")
                    .map((character) => character.trim()),
                },
              });
              console.log(formState);
            }}
            placeholder="Eg. Han Solo, Darth Vader"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Pick an audio clue:</Text>
        {pickedAudio ? (
          <View style={styles.selectedAudioContainer}>
            <Text style={styles.fileName}>Selected: {pickedAudio.name}</Text>
            <TouchableOpacity
              style={styles.unselectButton}
              onPress={() => setPickedAudio(null)}
            >
              <Text style={styles.unselectButtonText}>Unselect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.audioPickerButton}
            onPress={handlePickAudio}
          >
            <Text style={styles.audioPickerButtonText}>Choose Audio File</Text>
          </TouchableOpacity>
        )}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? "Identifying..." : "Identify Movie"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#555",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 80,
  },
  formRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    width: 100,
    marginRight: 10,
  },
  formInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    minHeight: 40,
    backgroundColor: "#f9f9f9",
  },
  audioPickerButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  resultContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#e6ffe6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c3e6cb",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#155724",
  },
  movieName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 8,
    textAlign: "center",
  },
  confidence: {
    fontSize: 16,
    color: "#155724",
    marginBottom: 5,
  },
  inputsUsed: {
    fontSize: 14,
    color: "#155724",
  },
  partialResultContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeeba",
  },
  partialResultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#85640a",
  },
  suggestionsText: {
    fontSize: 16,
    color: "#85640a",
  },
  selectedAudioContainer: {
    alignItems: "flex-start", // Align items to the start (left)
    paddingVertical: 10,
  },
  fileName: {
    fontSize: 16,
    color: "#777",
    marginBottom: 5, // Add some space between the text and the button
  },
  unselectButton: {
    backgroundColor: "#dc3545", // A red color for unselect
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start", // Align the button to the start (left)
  },
  unselectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default IdentifyMovieScreen;
