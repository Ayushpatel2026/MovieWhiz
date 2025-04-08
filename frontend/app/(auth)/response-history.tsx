import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StoredResponse } from '../../types/types'; 
import { getResponseHistory } from '../../api/apiClient';  
import { Ionicons } from '@expo/vector-icons';


const ResponseHistoryScreen = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [history, setHistory] = useState<StoredResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponseHistory = async () => {
      setLoading(true);
      setError(null); 
      try {
        if (userId) {
          const responseHistoryData = await getResponseHistory(userId);
          console.log('Response history data:', responseHistoryData);
          setHistory(responseHistoryData);
        }
      } catch (err: any) {
        setError('Failed to load response history.');
        console.error('Error fetching response history:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseHistory();
  }, [userId]);

  const navigateToIdentifyMovie = () => {
    router.push({
      pathname: '/identify-movie',
      params: { userId },
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading response history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
        <Text style={styles.title}>Response History</Text>
        {history && history.length > 0 ? (
          history.map((response) => (
            <View key={response.forumResponse.responseId} style={styles.historyItem}>
              <Text style={styles.movieName}>{response.forumResponse.movieName}</Text>
              <Text style={styles.confidence}>Confidence: {response.forumResponse.overallConfidence}%</Text>
              <Text style={styles.timeStamp}>
                Time Stamp: {response.forumResponse.timeStamp}
              </Text>
              <Text style={styles.inputsUsed}>Inputs Used: {response.forumResponse.inputsUsed.join(', ')}</Text>
            </View>
          ))
        ) : (
          <View>
            <Text style={styles.noHistoryText}>No response history available for this user.</Text>
          </View>
        )}
      </ScrollView>
  
      {/* New Button */}
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
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  movieName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  timeStamp: {
    fontSize: 14,
    color: '#777',
    marginBottom: 3,
  },
  inputsUsed: {
    fontSize: 14,
    color: '#777',
  },
  noHistoryText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default ResponseHistoryScreen;