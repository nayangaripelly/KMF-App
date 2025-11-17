import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getClients, type Client } from '@/services/api';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

export default function WorkScreen() {
  const { user, token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (user?.id && token) {
      loadClients();
    }
  }, [user?.id, token]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[WORK PAGE] Screen focused, refreshing clients...');
      if (user?.id && token) {
        loadClients();
      }
    }, [user?.id, token])
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phoneNo.includes(searchQuery)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    if (!user?.id || !token) return;

    setIsLoading(true);
    try {
      console.log('[WORK PAGE] Loading clients for userId:', user.id);
      const fetchedClients = await getClients(user.id, token);
      console.log('[WORK PAGE] Loaded clients:', fetchedClients);
      setClients(fetchedClients);
      setFilteredClients(fetchedClients);
      
      // If no clients found, log a warning
      if (fetchedClients.length === 0) {
        console.warn('[WORK PAGE] No clients found. Backend should auto-seed, but check if userId matches.');
        console.log('[WORK PAGE] User ID from token:', user.id);
      }
    } catch (error) {
      console.error('[WORK PAGE] Error loading clients:', error);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  const getStatusBadge = (client: Client) => {
    // Check if client has an active lead
    const hasActiveLead = false; // TODO: Check from leads data
    return hasActiveLead ? 'Active' : 'Pending';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'Active' ? '#34C759' : '#FF9500';
  };

  const getStatusBadgeBgColor = (status: string) => {
    return status === 'Active' ? '#E8F5E9' : '#FFF3E0';
  };

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText>Please log in to view your clients.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <View style={styles.logo}>
            <ThemedText style={styles.logoText}>F</ThemedText>
          </View>
        </View>
        <ThemedText type="title" style={styles.title}>✅ Work</ThemedText>
        <View style={[styles.headerSide, { justifyContent: 'flex-end' }]}>
          <View style={styles.notificationContainer}>
            <IconSymbol name="bell.fill" size={22} color="#FFB800" />
            <View style={styles.notificationDot} />
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{(user.username?.slice(0,2) || 'U').toUpperCase()}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={18} color="#8AA0B3" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients by name or phone..."
            placeholderTextColor="#8AA0B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ThemedText style={styles.clientCount}>Today's Clients: {filteredClients.length} found</ThemedText>
      </View>

      {/* Clients List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : filteredClients.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>No clients found</ThemedText>
          </View>
        ) : (
          filteredClients.map((client) => {
            const status = getStatusBadge(client);
            return (
              <TouchableOpacity
                key={client._id}
                style={styles.clientCard}
                onPress={() => router.push(`/client-detail?id=${client._id}`)}>
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <ThemedText type="defaultSemiBold" style={styles.clientName}>
                      {client.name}
                    </ThemedText>
                    <View style={styles.phoneContainer}>
                      <IconSymbol name="phone.fill" size={16} color="#FF5C8A" />
                      <ThemedText style={styles.phoneNumber}>+91 {client.phoneNo.slice(0)} </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusBadgeBgColor(status),
                      },
                    ]}>
                    <ThemedText
                      style={[
                        styles.statusText,
                        {
                          color: getStatusBadgeColor(status),
                        },
                      ]}>
                      {status}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => router.push(`/client-detail?id=${client._id}`)}>
                  <ThemedText style={styles.viewDetailsText}>View Details</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
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
    backgroundColor: '#F5FAFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E6EEF9',
    borderBottomWidth: 1,
  },
  headerSide: { flexDirection: 'row', alignItems: 'center', gap: 12, width: 64 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a7ea4',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F5FAFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1EAF4',
    marginBottom: 8,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clientCount: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '600',
    paddingLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
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
  clientCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF9',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(10, 126, 164, 0.08)' }
      : {
          shadowColor: '#0a7ea4',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a7ea4',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#2A4B5E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '700',
  },
});

