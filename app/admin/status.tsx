import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import AdminBottomNav from '@/components/admin-bottom-nav';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface Client {
  id: string;
  name: string;
  phone: string;
  loanType: string;
  loanTypeColor: 'blue' | 'green' | 'orange';
  salesperson: string;
  status: 'Cold' | 'Warm' | 'Hot';
  statusColor: 'blue' | 'yellow' | 'red';
}

export default function AdminStatusPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Cold' | 'Warm' | 'Hot'>('all');

  // Mock data: all clients across all salespersons
  const allClients: Client[] = [
    {
      id: '1',
      name: 'John Anderson',
      phone: '+1 (555) 123-4567',
      loanType: 'Personal Loan',
      loanTypeColor: 'blue',
      salesperson: 'Alex Johnson',
      status: 'Cold',
      statusColor: 'blue',
    },
    {
      id: '2',
      name: 'Sarah Mitchell',
      phone: '+1 (555) 234-5678',
      loanType: 'Business Loan',
      loanTypeColor: 'green',
      salesperson: 'Maria Garcia',
      status: 'Warm',
      statusColor: 'yellow',
    },
    {
      id: '3',
      name: 'Michael Chen',
      phone: '+1 (555) 345-6789',
      loanType: 'Home Loan',
      loanTypeColor: 'orange',
      salesperson: 'David Kumar',
      status: 'Hot',
      statusColor: 'red',
    },
    {
      id: '4',
      name: 'Emma Wilson',
      phone: '+1 (555) 456-7890',
      loanType: 'Personal Loan',
      loanTypeColor: 'blue',
      salesperson: 'Lisa Chen',
      status: 'Warm',
      statusColor: 'yellow',
    },
    {
      id: '5',
      name: 'James Rodriguez',
      phone: '+1 (555) 567-8901',
      loanType: 'Business Loan',
      loanTypeColor: 'green',
      salesperson: 'Alex Johnson',
      status: 'Cold',
      statusColor: 'blue',
    },
    {
      id: '6',
      name: 'Amanda Brown',
      phone: '+1 (555) 678-9012',
      loanType: 'Home Loan',
      loanTypeColor: 'orange',
      salesperson: 'Maria Garcia',
      status: 'Hot',
      statusColor: 'red',
    },
  ];

  const filteredClients = allClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    const matchesStatus = selectedFilter === 'all' || client.status === selectedFilter;
    return matchesSearch && matchesStatus;
  });

  const getLoanTypeTagStyle = (color: 'blue' | 'green' | 'orange') => {
    const styles = {
      blue: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      green: { backgroundColor: '#D1FAE5', color: '#065F46' },
      orange: { backgroundColor: '#FED7AA', color: '#9A3412' },
    };
    return styles[color];
  };

  const getStatusTagStyle = (color: 'blue' | 'yellow' | 'red') => {
    const styles = {
      blue: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      yellow: { backgroundColor: '#FEF3C7', color: '#92400E' },
      red: { backgroundColor: '#FEE2E2', color: '#991B1B' },
    };
    return styles[color];
  };

  const getCardBgStyle = (status: 'Cold' | 'Warm' | 'Hot') => {
    const styles = {
      Cold: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
      Warm: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
      Hot: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    };
    return styles[status];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F4FF' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Status
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {(user?.username?.slice(0, 2) || 'U').toUpperCase()}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}>
          {(['all', 'Cold', 'Warm', 'Hot'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                selectedFilter === filter && styles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}>
                {filter === 'all' ? 'All' : filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#9BA1A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name…"
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Client Cards */}
        <View style={styles.clientsList}>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <View
                key={client.id}
                style={[styles.clientCard, getCardBgStyle(client.status)]}>
                <View style={styles.clientCardContent}>
                  <IconSymbol name="phone.fill" size={20} color="#0a7ea4" />
                  <View style={styles.clientInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.clientName}>
                      {client.name}
                    </ThemedText>
                    <Text style={styles.salespersonName}>{client.salesperson}</Text>
                    <View style={styles.tagsContainer}>
                      <View
                        style={[
                          styles.tag,
                          getLoanTypeTagStyle(client.loanTypeColor),
                        ]}>
                        <Text
                          style={[
                            styles.tagText,
                            { color: getLoanTypeTagStyle(client.loanTypeColor).color },
                          ]}>
                          {client.loanType}
                        </Text>
                      </View>
                      <View style={[styles.tag, getStatusTagStyle(client.statusColor)]}>
                        <Text
                          style={[
                            styles.tagText,
                            { color: getStatusTagStyle(client.statusColor).color },
                          ]}>
                          {client.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clients found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <AdminBottomNav activeTab="status" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F',
    flex: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    gap: 12,
    paddingRight: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterPillActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A5F',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A5F',
  },
  clientsList: {
    gap: 12,
  },
  clientCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  salespersonName: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9BA1A6',
  },
});

