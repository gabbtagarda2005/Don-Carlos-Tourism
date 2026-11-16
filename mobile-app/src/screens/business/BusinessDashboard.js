import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import businessAPI from '../../api/business.api';

export default function BusinessDashboard() {
  const [stats, setStats] = useState({
    views: 0,
    inquiries: 0,
    rating: 0,
  });

  useEffect(() => {
    // Fetch business statistics
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Placeholder for loading actual stats
      setStats({
        views: 142,
        inquiries: 23,
        rating: 4.5,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Business Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.views}</Text>
          <Text style={styles.statLabel}>Profile Views</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.inquiries}</Text>
          <Text style={styles.statLabel}>Inquiries</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
    </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
