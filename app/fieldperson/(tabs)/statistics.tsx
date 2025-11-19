import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMeetStatistics } from '@/services/api';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SFSymbols6_0 } from 'sf-symbols-typescript';

interface MeetStatCard {
  title: string;
  value: number;
  icon: SFSymbols6_0;
  color: string;
  bgColor: string;
}

export default function FieldPersonStatisticsScreen() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalMeets: 0,
    met: 0,
    notmet: 0,
    meetagain: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (user?.id && token) {
      loadStatistics();
    }
  }, [user?.id, token]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id && token) {
        loadStatistics();
      }
    }, [user?.id, token])
  );

  const loadStatistics = async () => {
    if (!user?.id || !token) return;

    try {
      setIsLoading(true);
      const data = await getMeetStatistics(user.id, token);
      setStats({
        totalMeets: data.totalMeets,
        met: data.meetStatusCounts.met ?? 0,
        notmet: data.meetStatusCounts.notmet ?? 0,
        meetagain: data.meetStatusCounts.meetagain ?? 0,
      });
    } catch (error) {
      console.error('[FIELD STATS] Error fetching meet statistics:', error);
      setStats({
        totalMeets: 0,
        met: 0,
        notmet: 0,
        meetagain: 0,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const statCards: MeetStatCard[] = [
    {
      title: 'Total Meets',
      value: stats.totalMeets,
      icon: 'figure.walk',
      color: '#0a7ea4',
      bgColor: '#E3F2FD',
    },
    {
      title: 'Met Clients',
      value: stats.met,
      icon: 'checkmark.circle.fill',
      color: '#34C759',
      bgColor: '#E8F5E9',
    },
    {
      title: 'Not Met',
      value: stats.notmet,
      icon: 'xmark.circle.fill',
      color: '#FF3B30',
      bgColor: '#FFEBEE',
    },
    {
      title: 'Need to Meet Again',
      value: stats.meetagain,
      icon: 'arrow.triangle.2.circlepath.circle.fill',
      color: '#FF9500',
      bgColor: '#FFF3E0',
    },
  ];

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ThemedText>Please log in to view statistics.</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <ThemedText style={styles.logoText}>F</ThemedText>
          </View>
        </View>
        <ThemedText type="title" style={styles.title}>
          📊 Meet Statistics
        </ThemedText>
        <View style={styles.rightHeader}>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{user.username?.[0]?.toUpperCase() || 'F'}</ThemedText>
            </View>
          </TouchableOpacity>
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
            {statCards.map((card) => (
              <View
                key={card.title}
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
                  {/* <IconSymbol name={card.icon} size={32} color={card.color} /> */}
                </View>
                <ThemedText style={[styles.statValue, { color: card.color }]}>{card.value}</ThemedText>
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

