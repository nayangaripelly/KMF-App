import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMeetLogs, type MeetLog, type MeetStatus } from '@/services/api';
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

type FilterType = 'All' | MeetStatus;

const statusMeta: Record<FilterType, { label: string; color: string; bg: string; icon: string }> = {
  All: { label: 'All', color: '#0a7ea4', bg: '#E3F2FD', icon: 'line.horizontal.3.decrease.circle' },
  met: { label: 'Met', color: '#34C759', bg: '#E8F5E9', icon: 'checkmark.seal.fill' },
  notmet: { label: 'Not Met', color: '#FF3B30', bg: '#FFEBEE', icon: 'xmark.seal.fill' },
  meetagain: { label: 'Meet Again', color: '#FF9500', bg: '#FFF3E0', icon: 'arrow.clockwise.circle.fill' },
};

export default function FieldPersonStatusScreen() {
  const { user, token } = useAuth();
  const [meetLogs, setMeetLogs] = useState<MeetLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
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
      const logs = await getMeetLogs(user.id, token);
      setMeetLogs(logs);
    } catch (error) {
      console.error('[FIELD STATUS] Failed to load meet logs:', error);
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

  const filteredLogs = useMemo(() => {
    let logs = meetLogs;

    if (activeFilter !== 'All') {
      logs = logs.filter((log) => log.meetStatus === activeFilter);
    }

    if (searchQuery.trim()) {
      logs = logs.filter(
        (log) =>
          log.clientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.clientId.phoneNo.includes(searchQuery)
      );
    }

    return logs;
  }, [meetLogs, activeFilter, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ThemedText>Please log in to view meet status.</ThemedText>
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
          📋 Meet Status
        </ThemedText>
        <View style={styles.rightHeader}>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{user.username?.[0]?.toUpperCase() || 'F'}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {(Object.keys(statusMeta) as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              {
                borderColor: activeFilter === filter ? statusMeta[filter].color : '#E0E0E0',
                backgroundColor: activeFilter === filter ? statusMeta[filter].bg : '#FFFFFF',
              },
            ]}
            onPress={() => setActiveFilter(filter)}>
            {/* <IconSymbol
              name={statusMeta[filter].icon as any}
              size={18}
              color={activeFilter === filter ? statusMeta[filter].color : '#9BA1A6'}
            /> */}
            <ThemedText
              style={[
                styles.filterText,
                { color: activeFilter === filter ? statusMeta[filter].color : '#666666' },
              ]}>
              {statusMeta[filter].label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name='magnifyingglass' size={20} color="#9BA1A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name..."
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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
        ) : filteredLogs.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>No meet records found</ThemedText>
          </View>
        ) : (
          filteredLogs.map((log) => {
            const meta = statusMeta[log.meetStatus];
            return (
              <View
                key={log._id}
                style={[
                  styles.meetCard,
                  {
                    backgroundColor: meta.bg,
                    ...(Platform.OS === 'web'
                      ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }
                      : {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }),
                  },
                ]}>
                <View style={styles.meetCardHeader}>
                  <View style={styles.clientInfo}>
                    <ThemedText style={[styles.clientName, { color: meta.color }]}>{log.clientId.name}</ThemedText>
                    <ThemedText style={styles.clientPhone}>{log.clientId.phoneNo}</ThemedText>
                    <ThemedText style={styles.meetTimestamp}>{formatDate(log.timestamp)}</ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: meta.color }]}>
                    <ThemedText style={[styles.statusBadgeText, { color: meta.color }]}>
                      {meta.label}
                    </ThemedText>
                  </View>
                </View>
                {log.distanceTravelled !== undefined && (
                  <View style={styles.distanceRow}>
                    <ThemedText style={styles.distanceText}>
                      Distance travelled: {log.distanceTravelled.toFixed(1)} km
                    </ThemedText>
                  </View>
                )}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
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
  meetCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  meetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#2A4B5E',
    marginBottom: 4,
  },
  meetTimestamp: {
    fontSize: 12,
    color: '#666666',
  },
  statusBadge: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#2A4B5E',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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

