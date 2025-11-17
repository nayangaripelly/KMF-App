import AdminBottomNav from '@/components/admin-bottom-nav';
import AssignModal from '@/components/assign-modal';
import CreateClientForm from '@/components/create-client-form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Client {
  id: string;
  name: string;
  phone: string;
  location:string;
}

interface Salesperson {
  _id: string;
  username: string;
  emailId: string;
  passwordhash: string;
  role: string;
  createdAt: string;
}

export default function AssignWorkPage() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');

  // Mock salespersons - TODO: Fetch from API
  // const salespersons: Salesperson[] = [
  //   { id: 'sp1', name: 'Alex Johnson' },
  //   { id: 'sp2', name: 'Maria Garcia' },
  //   { id: 'sp3', name: 'David Kumar' },
  //   { id: 'sp4', name: 'Lisa Chen' },
  // ];
  // useeffect to fetch salespersons from api
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        console.log("Fetching salespersons...");
        const response = await fetch("http://localhost:3003/api/v1/users/salespersons", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
        console.log("Fetched salespersons:", data);
  
        if (data.success && Array.isArray(data.salespersons)) {
          setSalespersons(data.salespersons);
        } else {
          console.warn("Salespersons data missing or invalid:", data);
          setSalespersons([]);
        }
      } catch (error) {
        console.error("Error fetching salespersons:", error);
        setSalespersons([]);
      }
    };
  
    fetchSalespersons();
  }, [token]);
  

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const handleCreateClient = (newClient: { name: string; phone: string; location: string }) => {
    console.log("Creating client...");
    const client: Client = {
      id: String(Date.now()),
      name: newClient.name,
      phone: newClient.phone,
      location : newClient.location
    };
    setClients([...clients, client]);
    setShowCreateForm(false);
  };

  // const handleAssignClient = (salesperson: Salesperson) => {
  //   console.log("Assigning client...");
  //   const assignedClient = null;
  //   if (selectedClientForAssign) {
  //     setClients(clients.filter((c) => c.id !== selectedClientForAssign.id));
  //     for(clients of unassignedClients)
  //     setSelectedClientForAssign(null);
  //   }
  // };

  const handleAssignClient = async (salesperson: Salesperson) => {
    if (!selectedClientForAssign) return;
  
    try {
      const response = await fetch("http://localhost:3003/api/v1/clients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedClientForAssign.name,
          phone: selectedClientForAssign.phone,
          location:selectedClientForAssign.location,
          salespersonId: '691746c62ac921398cb37a9c', //testing
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        // Update UI only after DB update is successful
        setClients((prev) =>
          prev.filter((c) => c.id !== selectedClientForAssign.id)
        );
  
        setSelectedClientForAssign(null);
  
        console.log("Client assigned successfully");
      } else {
        console.warn("Failed to assign client:", data.e.message || data.msg);
      }
    } catch (error) {
      console.error("Error assigning client:", error);
    }
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F4FF' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Assign Work
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
        visible={selectedClientForAssign != null}
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

