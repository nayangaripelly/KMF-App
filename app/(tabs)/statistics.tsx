import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { getStatistics } from '@/services/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function StatisticsScreen() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalCalls: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (user?.id && token) {
      loadStatistics();
    }
  }, [user?.id, token]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[STATISTICS PAGE] Screen focused, refreshing statistics...');
      if (user?.id && token) {
        loadStatistics();
      }
    }, [user?.id, token])
  );

  const loadStatistics = async () => {
    if (!user?.id || !token) return;

    try {
      setIsLoading(true);
      const data = await getStatistics(user.id, token);
      setStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText>Please log in to view statistics.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const statCards = [
    {
      title: 'Total Calls Made',
      value: stats.totalCalls,
      icon: 'phone.fill',
      color: '#2196F3',
      bgColor: '#E3F2FD',
    },
    {
      title: 'Total Hot Leads',
      value: stats.hotLeads,
      icon: 'flame.fill',
      color: '#F44336',
      bgColor: '#FFEBEE',
    },
    {
      title: 'Total Warm Leads',
      value: stats.warmLeads,
      icon: 'thermometer.sun.fill',
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
    {
      title: 'Total Cold Leads',
      value: stats.coldLeads,
      icon: 'snowflake',
      color: '#2196F3',
      bgColor: '#E3F2FD',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <ThemedText style={styles.logoText}>F</ThemedText>
          </View>
        </View>
        <ThemedText type="title" style={styles.title}>
          📊 Statistics
        </ThemedText>
        <View style={styles.rightHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {statCards.map((card, index) => (
              <View
                key={index}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: card.bgColor,
                    ...(Platform.OS === 'web'
                      ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }
                      : {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }),
                  },
                ]}>
                <View style={styles.statCardHeader}>
                  <IconSymbol name={card.icon} size={32} color={card.color} />
                </View>
                <ThemedText style={[styles.statValue, { color: card.color }]}>
                  {card.value}
                </ThemedText>
                <ThemedText style={styles.statTitle}>{card.title}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    width: 40,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  rightHeader: {
    width: 40,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  statCardHeader: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
});

