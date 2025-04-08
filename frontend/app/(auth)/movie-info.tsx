import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Movie, MovieStreamingInfo } from '../../types/types';
import { getMovieInfo, getStreamingInfo } from '../../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from "@react-native-firebase/auth";

const MovieInfoScreen = () => {
  const { movieTitle } = useLocalSearchParams<{ movieTitle: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [streamingInfo, setStreamingInfo] = useState<MovieStreamingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (movieTitle) {
          console.log('Fetching movie details for:', movieTitle);
          const movieData = await getMovieInfo(movieTitle);
          if (!movieData) {
            setError('Movie not found.');
            return;
          }
          console.log('Movie data:', movieData);
          setMovie(movieData);

          console.log('Fetching streaming info for:', movieTitle);
          const streamingData = await getStreamingInfo(movieTitle);
          if (!streamingData) {
            setError('Streaming info not found.');
            return;
          }
          console.log('Streaming data:', streamingData);
          setStreamingInfo(streamingData);
        }
      } catch (err: any) {
        setError('Failed to load movie details.');
        console.error('Error fetching movie details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieTitle]);

  const navigateToIdentifyMovie = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user?.uid;
    router.push({
      pathname: '/identify-movie',
      params: { userId },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading movie information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{movieTitle.split('-')}</Text>
        {movie ? (
          <>
            <Text style={styles.year}>({movie.year})</Text>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genre</Text>
              <Text>{movie?.genre ? movie.genre.join(', ') : "N/A"}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Director</Text>
              <Text>{movie?.director || "N/A"}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actors</Text>
              <Text>{movie?.actors ? movie.actors.join(', ') : "N/A"}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Characters</Text>
              <Text>{movie?.characters ? movie.characters.join(', ') : "N/A"}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <Text>{movie?.settings ? movie.settings.join(', ') : "N/A"}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Soundtracks</Text>
              <Text>{movie?.soundtracks ? movie.soundtracks.join(', ') : "N/A"}</Text>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text>Movie Information Not Found</Text>
          </View>
        )}

        {streamingInfo && streamingInfo.links.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streaming On</Text>
            {streamingInfo.links.map((link, index) => (
              <TouchableOpacity key={index} onPress={() => Linking.openURL(link.link)}>
                <Text style={styles.streamLink}>
                  {link.platform}: {link.link}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streaming On</Text>
            <Text>No streaming information available for this movie.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.identifyButton} onPress={navigateToIdentifyMovie}>
        <Text style={styles.identifyButtonText}>🔍 Identify a New Movie</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  identifyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
    marginHorizontal: 20,
    elevation: 3,
  },
  identifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  year: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
  },
  streamLink: {
    color: '#1d4ed8',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
});

export default MovieInfoScreen;
