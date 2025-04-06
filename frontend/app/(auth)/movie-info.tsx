import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Movie, MovieStreamingInfo } from '../../types/types';
import { getMovieInfo, getStreamingInfo } from '../../api/apiClient';

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
					console.log("Movie genre:", movie?.genre)

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading movie information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{movieTitle.split('-')}</Text>
      {movie ? <>
        <Text style={styles.year}>({movie.year})</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genre</Text>
          <Text>{movie?.genre ? movie.genre.join(', ') : "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Director</Text>
          <Text>{movie?.director ? movie.director : "N/A"}</Text>
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
          <Text style={styles.sectionTitle}>Setting</Text>
          <Text>{movie?.setting ? movie.setting : "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soundtracks</Text>
          <Text>{movie?.soundtracks ? movie.soundtracks.join(', ') : "N/A"}</Text>
        </View>
      </> : (
        <View style={styles.section}>
        <Text>Movie Information Not Found</Text>
      </View>
      )}

      {streamingInfo && streamingInfo.links.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaming On</Text>
          {streamingInfo.links.map((link, index) => (
            <Text key={index}>{link.platform}: {link.link}</Text>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaming On</Text>
          <Text>No streaming information available for this movie.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
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
});

export default MovieInfoScreen;