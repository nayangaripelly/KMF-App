import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { getLeads, type Lead } from '@/services/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

type FilterType = 'All' | 'Cold' | 'Warm' | 'Hot';

export default function StatusScreen() {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (user?.id && token) {
      loadLeads();
    }
  }, [user?.id, token]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[STATUS PAGE] Screen focused, refreshing leads...');
      if (user?.id && token) {
        loadLeads();
      }
    }, [user?.id, token])
  );

  const loadLeads = async () => {
    if (!user?.id || !token) return;

    try {
      setIsLoading(true);
      const data = await getLeads(user.id, token);
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeads();
  };

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Apply status filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter((lead) => lead.loanStatus.toLowerCase() === activeFilter.toLowerCase());
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (lead) =>
          lead.clientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.clientId.phoneNo.includes(searchQuery)
      );
    }

    return filtered;
  }, [leads, activeFilter, searchQuery]);

  const getCardBackgroundColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cold':
        return '#E3F2FD'; // Light blue
      case 'warm':
        return '#FFF9C4'; // Light yellow
      case 'hot':
        return '#FFE0E6'; // Light pink
      default:
        return '#F5F5F5';
    }
  };

  const getTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cold':
        return '#1976D2'; // Dark blue
      case 'warm':
        return '#2E7D32'; // Dark green
      case 'hot':
        return '#C62828'; // Dark red
      default:
        return '#333';
    }
  };

  const getLoanTypeColor = (loanType: string) => {
    const colors: Record<string, string> = {
      personal: '#9C27B0',
      business: '#2E7D32',
      student: '#FF6F00',
      home: '#FF5722',
    };
    return colors[loanType.toLowerCase()] || '#666';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      cold: '#2196F3',
      warm: '#FFC107',
      hot: '#F44336',
    };
    return colors[status.toLowerCase()] || '#666';
  };

  if (!user?.id || !token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText>Please log in to view your leads.</ThemedText>
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
          📋 Status
        </ThemedText>
        <View style={styles.rightHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['All', 'Cold', 'Warm', 'Hot'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
              {
                backgroundColor:
                  activeFilter === filter
                    ? colorScheme === 'dark'
                      ? '#4A4A4A'
                      : '#F5F5F5'
                    : '#FFFFFF',
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
            ]}
            onPress={() => setActiveFilter(filter)}>
            <ThemedText
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}>
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
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
            placeholder="Search by name..."
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Leads List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : filteredLeads.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>No leads found</ThemedText>
          </View>
        ) : (
          filteredLeads.map((lead) => {
            const bgColor = getCardBackgroundColor(lead.loanStatus);
            const textColor = getTextColor(lead.loanStatus);
            const loanTypeColor = getLoanTypeColor(lead.loanType);
            const badgeColor = getStatusBadgeColor(lead.loanStatus);

            return (
              <View
                key={lead._id}
                style={[
                  styles.leadCard,
                  {
                    backgroundColor: bgColor,
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
                <View style={styles.leadContent}>
                  <View style={styles.leadLeft}>
                    <ThemedText style={[styles.leadName, { color: textColor }]}>
                      {lead.clientId.name}
                    </ThemedText>
                    <ThemedText style={[styles.loanType, { color: loanTypeColor }]}>
                      {lead.loanType.charAt(0).toUpperCase() + lead.loanType.slice(1)} Loan
                    </ThemedText>
                  </View>
                  <View style={styles.leadRight}>
                    <ThemedText style={[styles.leadDate, { color: '#9BA1A6' }]}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                      <ThemedText style={styles.statusBadgeText}>
                        {lead.loanStatus.charAt(0).toUpperCase() + lead.loanStatus.slice(1)}
                      </ThemedText>
                    </View>
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
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterTabActive: {
    borderColor: '#0a7ea4',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    fontWeight: '600',
    color: '#0a7ea4',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  leadCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  leadContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leadLeft: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  loanType: {
    fontSize: 14,
    fontWeight: '600',
  },
  leadRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  leadDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

