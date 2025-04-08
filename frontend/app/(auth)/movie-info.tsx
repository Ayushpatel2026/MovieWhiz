import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Movie, MovieStreamingInfo } from '../../types/types';
import { getMovieInfo, getStreamingInfo } from '../../api/apiClient';
import { Ionicons } from '@expo/vector-icons';

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
          console.log("Movie genre:", movie?.genre);

          console.log('Fetching streaming info for:', movieTitle);
          const streamingData = await getStreamingInfo(movieTitle);
          setStreamingInfo(streamingData);
          console.log('Streaming data from API:', streamingData);
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

    const handleLinkPress = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('An error occurred opening the link:', err));
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
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{movieTitle.split('-').join(' ')}</Text>
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
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <Text>{movie?.settings ? movie.settings.join(', ') : "N/A"}</Text>
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
                <View style={styles.streamingSection}>
                    <Text style={styles.streamingSectionTitle}>Watch Now</Text>
                    {streamingInfo.links.map((link, index) => (
                        <TouchableOpacity key={index} style={styles.streamingLink} onPress={() => handleLinkPress(link.link)}>
                            <Text style={styles.platformText}>On {link.platform}:</Text>
                            <Text style={styles.clickableLinkText}>Watch Here</Text>
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
    // Styles for the Streaming Section
    streamingSection: {
        marginTop: 30,
        backgroundColor: '#e6f7ff', // A light, distinct background
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#91d5ff', // A slightly darker border
    },
    streamingSectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1890ff', // A prominent color for the title
        textAlign: 'center',
    },
    streamingLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#bae7ff',
    },
    platformText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#13c2c2', // A different accent color for the platform
        marginRight: 10,
    },
    clickableLinkText: {
      fontSize: 16,
      color: '#52c41a', // A green color to indicate clickability
      textDecorationLine: 'underline',
      flex: 1,
      textAlign: 'right',
    },
});

export default MovieInfoScreen;