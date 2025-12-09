import AdminBottomNav from '@/components/admin-bottom-nav';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const API_URL="http://localhost:3003";
// const API_URL="http://192.168.106.199:3003";

interface Salesperson {
  _id: string;
  username: string;
  emailId: string;
  passwordhash: string;
  role: string;
  createdAt: string;
}

type RoleFilter = 'salesperson' | 'fieldperson';

export default function StatisticsPage() {
  const { user,token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<RoleFilter>('salesperson');
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [fieldpersons, setFieldpersons] = useState<Salesperson[]>([]);

  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/salespersons`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log('[STATISTICS] Fetched salespersons:', data);
        setSalespersons(data.salespersons != null? data.salespersons : []);
      } catch (error) {
        console.error('[STATISTICS] Error fetching salespersons:', error);
        setSalespersons([]);
      }
    };
    fetchSalespersons();
  }, [token]);

  useEffect(() => {
    const fetchFieldpersons = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/fieldpersons`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log('[STATISTICS] Fetched fieldpersons:', data);
        setFieldpersons(data.fieldpersons != null? data.fieldpersons : []);
      } catch (error) {
        console.error('[STATISTICS] Error fetching fieldpersons:', error);
        setFieldpersons([]);
      }
    };
    fetchFieldpersons();
  }, [token]);

  const currentList = activeRoleFilter === 'salesperson' ? salespersons : fieldpersons;

  const filteredList = currentList.filter((person) =>
    person.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStats = (person: Salesperson) => {
    router.push({
      pathname: '/admin/statistics/[id]',
      params: { 
        id: person._id, 
        name: person.username,
        role: activeRoleFilter,
      },
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
        {/* Role Filter Toggle */}
        <View style={styles.roleFilterContainer}>
          <TouchableOpacity
            style={[
              styles.roleFilterButton,
              activeRoleFilter === 'salesperson' && styles.roleFilterButtonActive,
            ]}
            onPress={() => setActiveRoleFilter('salesperson')}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.roleFilterText,
                activeRoleFilter === 'salesperson' && styles.roleFilterTextActive,
              ]}>
              Salespersons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleFilterButton,
              activeRoleFilter === 'fieldperson' && styles.roleFilterButtonActive,
            ]}
            onPress={() => setActiveRoleFilter('fieldperson')}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.roleFilterText,
                activeRoleFilter === 'fieldperson' && styles.roleFilterTextActive,
              ]}>
              Field Persons
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#9BA1A6" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeRoleFilter === 'salesperson' ? 'salesperson' : 'field person'} by name…`}
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* User List */}
        <View style={styles.salespersonList}>
          {filteredList.length > 0 ? (
            filteredList.map((person) => (
              <TouchableOpacity
                key={person._id}
                style={styles.salespersonCard}
                onPress={() => handleViewStats(person)}
                activeOpacity={0.7}>
                <View style={styles.salespersonCardContent}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(person.username)}</Text>
                  </View>
                  <View style={styles.salespersonInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.salespersonName}>
                      {person.username}
                    </ThemedText>
                    <Text style={styles.salespersonContact}>{person.emailId}</Text>
                    <Text style={styles.roleBadge}>
                      {activeRoleFilter === 'salesperson' ? '📞 Salesperson' : '🚶 Field Person'}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#9BA1A6" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {activeRoleFilter === 'salesperson' ? 'salespersons' : 'field persons'} found
              </Text>
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
  roleFilterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleFilterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleFilterButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  roleFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9BA1A6',
  },
  roleFilterTextActive: {
    color: '#FFFFFF',
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
  // avatar: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: '#0a7ea4',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // avatarText: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   color: '#FFFFFF',
  // },
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
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '600',
    marginTop: 2,
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

