import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMeetLogs, type MeetLog } from '@/services/api';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusStyles: Record<
  MeetLog['meetStatus'],
  { label: string; color: string; bg: string; icon: string }
> = {
  met: { label: 'Met', color: '#34C759', bg: '#E8F5E9', icon: 'person.crop.circle.badge.checkmark' },
  notmet: { label: 'Not Met', color: '#FF3B30', bg: '#FFEBEE', icon: 'person.crop.circle.badge.xmark' },
  meetagain: {
    label: 'Meet Again',
    color: '#FF9500',
    bg: '#FFF3E0',
    icon: 'arrow.triangle.2.circlepath.circle',
  },
};

export default function FieldPersonMeetLogsScreen() {
  const { user, token } = useAuth();
  const [meetLogs, setMeetLogs] = useState<MeetLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (user?.id && token) {
      loadMeetLogs();
    }
  }, [user?.id, token]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id && token) {
        loadMeetLogs();
      }
    }, [user?.id, token])
  );

  const loadMeetLogs = async () => {
    if (!user?.id || !token) return;
    setIsLoading(true);
    try {
      const data = await getMeetLogs(user.id, token);
      setMeetLogs(data);
    } catch (error) {
      console.error('[MEET LOGS] Error fetching meet logs:', error);
      setMeetLogs([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMeetLogs();
  };

  const filteredMeetLogs = useMemo(() => {
    if (!searchQuery.trim()) return meetLogs;
    return meetLogs.filter(
      (log) =>
        log.clientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.clientId.phoneNo.includes(searchQuery)
    );
  }, [meetLogs, searchQuery]);

  const formatTimeline = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ThemedText>Please log in to view meet logs.</ThemedText>
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
          📝 Meet Logs
        </ThemedText>
        <View style={styles.rightHeader}>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{user.username?.[0]?.toUpperCase() || 'F'}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#9BA1A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name or phone..."
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ThemedText style={styles.meetCount}>Total meets: {filteredMeetLogs.length}</ThemedText>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : filteredMeetLogs.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>No meet logs found</ThemedText>
          </View>
        ) : (
          filteredMeetLogs.map((log) => {
            const meta = statusStyles[log.meetStatus];
            return (
              <View
                key={log._id}
                style={[
                  styles.meetLogCard,
                  {
                    backgroundColor: '#FFFFFF',
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
                <View style={styles.meetLogContent}>
                  <View style={styles.meetLogLeft}>
                    <View style={styles.meetLogInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.clientName}>
                        {log.clientId.name}
                      </ThemedText>
                      <ThemedText style={styles.clientPhone}>{log.clientId.phoneNo}</ThemedText>
                      <ThemedText style={styles.meetTime}>{formatTimeline(log.timestamp)}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.meetLogRight}>
                    <View style={[styles.meetTypeBadge, { backgroundColor: meta.bg }]}>
                      <ThemedText style={[styles.meetTypeText, { color: meta.color }]}>{meta.label}</ThemedText>
                    </View>
                    {typeof log.distanceTravelled === 'number' && (
                      <ThemedText style={styles.distance}>
                        {log.distanceTravelled.toFixed(1)} km
                      </ThemedText>
                    )}
                  </View>
                </View>
                {log.notes && (
                  <View style={styles.notesContainer}>
                    <ThemedText style={styles.notesLabel}>Notes</ThemedText>
                    <ThemedText style={styles.notesText}>{log.notes}</ThemedText>
                  </View>
                )}
              </View>
            );
          })
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  meetCount: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
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
  emptyText: {
    fontSize: 16,
    color: '#9BA1A6',
  },
  meetLogCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  meetLogContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  meetLogLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  meetLogInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
  },
  meetTime: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  meetLogRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  meetTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  meetTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
});

