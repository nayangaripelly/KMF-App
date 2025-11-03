import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { getCallLogs, type CallLog } from '@/services/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CallLogsScreen() {
  const { user, token } = useAuth();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (user?.id && token) {
      loadCallLogs();
    }
  }, [user?.id, token]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[CALL LOGS PAGE] Screen focused, refreshing call logs...');
      if (user?.id && token) {
        loadCallLogs();
      }
    }, [user?.id, token])
  );

  const loadCallLogs = async () => {
    if (!user?.id || !token) return;

    try {
      setIsLoading(true);
      const data = await getCallLogs(user.id, token);
      setCallLogs(data);
    } catch (error) {
      console.error('Error loading call logs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCallLogs();
  };

  const filteredCallLogs = useMemo(() => {
    if (!searchQuery.trim()) return callLogs;

    return callLogs.filter(
      (log) =>
        log.clientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.clientId.phoneNo.includes(searchQuery)
    );
  }, [callLogs, searchQuery]);

  const getCallType = (log: CallLog): 'Incoming' | 'Outgoing' | 'Missed' => {
    // Use callType from backend if available
    if (log.callType) {
      return log.callType.charAt(0).toUpperCase() + log.callType.slice(1) as 'Incoming' | 'Outgoing' | 'Missed';
    }
    // Fallback to status-based mapping
    switch (log.status.toLowerCase()) {
      case 'connected':
        return 'Incoming';
      case 'rejected':
      case 'followup':
        return 'Outgoing';
      case 'missed':
        return 'Missed';
      default:
        return 'Incoming';
    }
  };

  const getCallTypeBadgeColor = (callType: string) => {
    switch (callType) {
      case 'Incoming':
        return '#34C759';
      case 'Outgoing':
        return '#2196F3';
      case 'Missed':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const getCallIcon = (callType: string) => {
    switch (callType) {
      case 'Incoming':
        return 'phone.fill';
      case 'Outgoing':
        return 'phone.arrow.up.right.fill';
      case 'Missed':
        return 'phone.down.fill';
      default:
        return 'phone.fill';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText>Please log in to view call logs.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

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
          📞 Call Logs
        </ThemedText>
        <View style={styles.rightHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
              borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0',
            },
          ]}>
          <IconSymbol name="magnifyingglass" size={20} color="#9BA1A6" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by name or phone..."
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ThemedText style={styles.callCount}>Total calls: {filteredCallLogs.length}</ThemedText>
      </View>

      {/* Call Logs List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : filteredCallLogs.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>No call logs found</ThemedText>
          </View>
        ) : (
          filteredCallLogs.map((log) => {
            const callType = getCallType(log);
            const badgeColor = getCallTypeBadgeColor(callType);
            const iconName = getCallIcon(callType);
            const iconColor = callType === 'Missed' ? '#FF3B30' : '#FF69B4';

            return (
              <View
                key={log._id}
                style={[
                  styles.callLogCard,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
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
                <View style={styles.callLogContent}>
                  <View style={styles.callLogLeft}>
                    <IconSymbol name={iconName} size={24} color={iconColor} />
                    <View style={styles.callLogInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.clientName}>
                        {log.clientId.name}
                      </ThemedText>
                      <ThemedText style={styles.phoneNumber}>{log.clientId.phoneNo}</ThemedText>
                      <ThemedText style={styles.callTime}>{formatDateTime(log.calledTime)}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.callLogRight}>
                    <View style={[styles.callTypeBadge, { backgroundColor: badgeColor }]}>
                      <ThemedText style={styles.callTypeText}>{callType}</ThemedText>
                    </View>
                    <ThemedText style={styles.duration}>
                      {log.duration || '12 min 34 sec'}
                    </ThemedText>
                  </View>
                </View>
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
  callCount: {
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
  callLogCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  callLogContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  callLogLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  callLogInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
  },
  callTime: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  callLogRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  callTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  duration: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
  },
});

