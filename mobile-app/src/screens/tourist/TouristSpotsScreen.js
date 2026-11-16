import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import touristSpotsAPI from '../../api/touristSpots.api';

export default function TouristSpotsScreen() {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const data = await touristSpotsAPI.getAllSpots();
      setSpots(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tourist Destinations</Text>
      <FlatList
        data={spots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.spotItem}>
            <Text style={styles.spotName}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </TouchableOpacity>
        )}
      />
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
  spotItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  spotName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
