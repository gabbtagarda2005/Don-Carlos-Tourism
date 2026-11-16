import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import eventsAPI from '../../api/events.api';

export default function CommunityEventsScreen() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
          </View>
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
  eventCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
