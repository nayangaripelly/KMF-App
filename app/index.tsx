import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Index() {
  const { user, token, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // If no token, redirect to login
    if (!token || !user) {
      router.replace('/login');
      return;
    }

    // If user is logged in, redirect based on role
    const role = user.role;

    if (role === 'admin') {
      // Check if already on admin route
      if (segments[0] !== 'admin') {
        router.replace('/admin/assign');
      }
    } else if (role === 'salesperson' || role === 'fieldperson') {
      // Check if already on tabs route
      if (segments[0] !== '(tabs)') {
        router.replace('/(tabs)/work');
      }
    } else {
      // Unknown role, redirect to login
      router.replace('/login');
    }
  }, [user, token, isLoading, segments]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9BA1A6',
  },
});

