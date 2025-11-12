import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AdminBottomNav from '@/components/admin-bottom-nav';
import CreateClientForm from '@/components/create-client-form';
import AssignModal from '@/components/assign-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Salesperson {
  id: string;
  name: string;
}

export default function AssignWorkPage() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  // Mock salespersons - TODO: Fetch from API
  const salespersons: Salesperson[] = [
    { id: 'sp1', name: 'Alex Johnson' },
    { id: 'sp2', name: 'Maria Garcia' },
    { id: 'sp3', name: 'David Kumar' },
    { id: 'sp4', name: 'Lisa Chen' },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const handleCreateClient = (newClient: { name: string; phone: string; location: string }) => {
    const client: Client = {
      id: String(Date.now()),
      name: newClient.name,
      phone: newClient.phone,
    };
    setClients([...clients, client]);
    setShowCreateForm(false);
  };

  const handleAssignClient = (salesperson: Salesperson) => {
    if (selectedClientForAssign) {
      setClients(clients.filter((c) => c.id !== selectedClientForAssign.id));
      setSelectedClientForAssign(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F4FF' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Assign Work
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
            placeholder="Search unassigned clients by name or phone…"
            placeholderTextColor="#9BA1A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Create New Client Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(true)}
          activeOpacity={0.8}>
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create New Client</Text>
        </TouchableOpacity>

        {/* Unassigned Clients List */}
        <View style={styles.clientsList}>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <View key={client.id} style={styles.clientCard}>
                <View style={styles.clientCardContent}>
                  <IconSymbol name="phone.fill" size={20} color="#0a7ea4" />
                  <View style={styles.clientInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.clientName}>
                      {client.name}
                    </ThemedText>
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => setSelectedClientForAssign(client)}
                  activeOpacity={0.8}>
                  <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No unassigned clients found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <AdminBottomNav activeTab="assign" />

      {/* Create Client Form */}
      <CreateClientForm
        visible={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateClient}
      />

      {/* Assign Salesperson Modal */}
      <AssignModal
        visible={!!selectedClientForAssign}
        client={selectedClientForAssign}
        salespersons={salespersons}
        onClose={() => setSelectedClientForAssign(null)}
        onAssign={handleAssignClient}
      />
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clientsList: {
    gap: 12,
  },
  clientCard: {
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
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  clientPhone: {
    fontSize: 14,
    color: '#0a7ea4',
  },
  assignButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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

