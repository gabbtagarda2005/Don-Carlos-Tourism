import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import touristSpotsAPI from '../../api/touristSpots.api';

export default function HomeScreen() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const data = await touristSpotsAPI.getAllSpots();
      setSpots(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Don Carlos</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.spotCard}>
              <Text style={styles.spotName}>{item.name}</Text>
              <Text>{item.category}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  spotCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
