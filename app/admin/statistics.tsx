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
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import AdminBottomNav from '@/components/admin-bottom-nav';

interface Salesperson {
  id: string;
  name: string;
  contact: string;
}

export default function StatisticsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const salespersons: Salesperson[] = [
    { id: 'sp1', name: 'Alex Johnson', contact: '+1 (555) 123-4567' },
    { id: 'sp2', name: 'Maria Garcia', contact: 'maria.garcia@company.com' },
    { id: 'sp3', name: 'David Kumar', contact: '+1 (555) 234-5678' },
    { id: 'sp4', name: 'Lisa Chen', contact: 'lisa.chen@company.com' },
    { id: 'sp5', name: 'James Rodriguez', contact: '+1 (555) 345-6789' },
    { id: 'sp6', name: 'Sarah Thompson', contact: 'sarah.thompson@company.com' },
  ];

  const filteredSalespersons = salespersons.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStats = (salesperson: Salesperson) => {
    router.push({
      pathname: '/admin/statistics/[id]',
      params: { id: salesperson.id, name: salesperson.name },
    } as any);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F4FF' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Statistics
        </ThemedText>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#9BA1A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search salesperson by name…"
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Salesperson List */}
        <View style={styles.salespersonList}>
          {filteredSalespersons.length > 0 ? (
            filteredSalespersons.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.salespersonCard}
                onPress={() => handleViewStats(person)}
                activeOpacity={0.7}>
                <View style={styles.salespersonCardContent}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(person.name)}</Text>
                  </View>
                  <View style={styles.salespersonInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.salespersonName}>
                      {person.name}
                    </ThemedText>
                    <Text style={styles.salespersonContact}>{person.contact}</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#9BA1A6" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No salespersons found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <AdminBottomNav activeTab="statistics" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  header: {
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
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
  salespersonList: {
    gap: 12,
  },
  salespersonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  salespersonCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  salespersonInfo: {
    flex: 1,
  },
  salespersonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  salespersonContact: {
    fontSize: 14,
    color: '#9BA1A6',
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

