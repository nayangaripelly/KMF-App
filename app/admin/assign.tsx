import AdminBottomNav from '@/components/admin-bottom-nav';
import AssignModal from '@/components/assign-modal';
import CreateClientForm from '@/components/create-client-form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { DocumentPickerAsset } from 'expo-document-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import Papa from 'papaparse';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';

interface Client {
  id: string;
  name: string;
  phone: string;
  location: string;
}

interface Salesperson {
  _id: string;
  username: string;
  emailId: string;
  passwordhash: string;
  role: string;
  createdAt: string;
}

type ImportedRow = Record<string, unknown>;

const CSV_MIME_TYPES = ['text/csv', 'application/csv', 'text/comma-separated-values'];
const EXCEL_MIME_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ACCEPTED_FILE_TYPES = [...CSV_MIME_TYPES, ...EXCEL_MIME_TYPES];

const PHONE_SANITIZE_REGEX = /[^\d]/g;

function normalizePhone(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  const hasPlusPrefix = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(PHONE_SANITIZE_REGEX, '');
  if (!digitsOnly) return '';
  return hasPlusPrefix ? `+${digitsOnly}` : digitsOnly;
}

function generateClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapRowToClient(row: ImportedRow): Omit<Client, 'id'> | null {
  const normalizedEntries = Object.entries(row || {}).reduce<Record<string, string>>((acc, [key, value]) => {
    const normalizedKey = key.trim().toLowerCase();
    const normalizedValue =
      typeof value === 'number'
        ? value.toString()
        : typeof value === 'string'
        ? value.trim()
        : '';
    if (!normalizedValue) {
      return acc;
    }
    acc[normalizedKey] = normalizedValue;
    return acc;
  }, {});

  const nameKeys = ['name', 'client name', 'customer name', 'full name'];
  const phoneKeys = ['phone', 'phone number', 'contact', 'contact number', 'mobile', 'mobile number'];
  const locationKeys = ['location', 'city', 'area', 'address', 'branch'];

  const name = nameKeys.map((key) => normalizedEntries[key]).find(Boolean) || '';
  const phoneRaw = phoneKeys.map((key) => normalizedEntries[key]).find(Boolean) || '';
  const location = locationKeys.map((key) => normalizedEntries[key]).find(Boolean) || '';

  const sanitizedPhone = normalizePhone(phoneRaw);

  if (!name || !sanitizedPhone) {
    return null;
  }

  return {
    name,
    phone: sanitizedPhone,
    location: location || 'Unknown',
  };
}

function transformRowsToClients(rows: ImportedRow[]): { clients: Client[]; skipped: number } {
  const clients: Client[] = [];
  let skipped = 0;
  const seenPhones = new Set<string>();

  rows.forEach((row) => {
    const maybeClient = mapRowToClient(row);
    if (!maybeClient) {
      skipped += 1;
      return;
    }

    if (seenPhones.has(maybeClient.phone)) {
      return;
    }

    seenPhones.add(maybeClient.phone);
    clients.push({
      ...maybeClient,
      id: generateClientId(),
    });
  });

  return { clients, skipped };
}

async function readRowsFromCsv(uri: string): Promise<ImportedRow[]> {
  let fileContents: string;
  
  if (Platform.OS === 'web') {
    // On web, fetch the file as text
    const response = await fetch(uri);
    fileContents = await response.text();
  } else {
    // On native, use FileSystem
    fileContents = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }
  
  const parsed = Papa.parse<ImportedRow>(fileContents, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) {
    console.warn('[ASSIGN] CSV parse warnings:', parsed.errors);
  }
  return parsed.data;
}

async function readRowsFromExcel(uri: string): Promise<ImportedRow[]> {
  let base64Data: string;
  
  if (Platform.OS === 'web') {
    // On web, fetch as array buffer and convert to base64
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
    base64Data = btoa(binaryString);
  } else {
    // On native, use FileSystem
    base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  
  const workbook = XLSX.read(base64Data, { type: 'base64' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    return [];
  }
  return XLSX.utils.sheet_to_json<ImportedRow>(worksheet, { defval: '' });
}

async function loadRowsFromAsset(asset: DocumentPickerAsset): Promise<ImportedRow[]> {
  const extension = asset.name?.split('.').pop()?.toLowerCase();
  const mimeType = asset.mimeType || '';

  if (extension === 'csv' || CSV_MIME_TYPES.includes(mimeType)) {
    return readRowsFromCsv(asset.uri);
  }

  if (extension === 'xls' || extension === 'xlsx' || EXCEL_MIME_TYPES.includes(mimeType)) {
    return readRowsFromExcel(asset.uri);
  }

  return readRowsFromCsv(asset.uri); // fallback
}

export default function AssignWorkPage() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [clientsPendingAssignment, setClientsPendingAssignment] = useState<Client[]>([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isUploadInProgress, setIsUploadInProgress] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
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
        const response = await fetch("http://192.168.137.231:3003/api/v1/users/salespersons", {
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
  

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients;
    }
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) || client.phone.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const selectedClients = useMemo(
    () => clients.filter((client) => selectedClientIds.includes(client.id)),
    [clients, selectedClientIds]
  );

  const hasSelection = selectedClientIds.length > 1;

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const clearSelection = () => setSelectedClientIds([]);

  const openAssignModal = (clientsToAssign: Client[]) => {
    if (!clientsToAssign.length) return;
    setClientsPendingAssignment(clientsToAssign);
    setIsAssignModalVisible(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalVisible(false);
    setClientsPendingAssignment([]);
  };

  const handleUploadClients = async () => {
    try {
      setIsUploadInProgress(true);
  
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_FILE_TYPES,
        multiple: false,
        copyToCacheDirectory: true,
      });
  
      if (result.canceled || !result.assets?.length) {
        return;
      }
  
      const file = result.assets[0];
      
      const rows = await loadRowsFromAsset({
        uri: file.uri,
        name: file.name ?? '',
        mimeType: file.mimeType ?? '',
      } as DocumentPickerAsset);
  
      if (!rows.length) {
        Alert.alert('File is empty', 'The selected file did not contain any rows to import.');
        return;
      }
  
      const { clients: parsedClients, skipped } = transformRowsToClients(rows);
      if (!parsedClients.length) {
        Alert.alert('No valid rows', 'Could not find valid client data in the file.');
        return;
      }
  
      const existingPhones = new Set(clients.map((client) => client.phone));
      const uniqueNewClients = parsedClients.filter(
        (client) => !existingPhones.has(client.phone)
      );
  
      if (!uniqueNewClients.length) {
        Alert.alert('No new clients', 'All clients already exist in the unassigned list.');
        return;
      }
  
      setClients((prev) => [...prev, ...uniqueNewClients]);
  
      const addedCount = uniqueNewClients.length;
      const duplicateCount = parsedClients.length - uniqueNewClients.length;
  
      const skippedMessageParts = [];
      if (duplicateCount > 0) skippedMessageParts.push(`${duplicateCount} duplicate`);
      if (skipped > 0) skippedMessageParts.push(`${skipped} invalid`);
  
      const skippedMessage =
        skippedMessageParts.length > 0 ? ` (${skippedMessageParts.join(', ')} skipped)` : '';
  
      Alert.alert('Import complete', `Added ${addedCount} client(s)${skippedMessage}.`);
    } catch (error) {
      console.error('Error importing clients:', error);
      Alert.alert('Import failed', 'Unable to import clients. Please try again.');
    } finally {
      setIsUploadInProgress(false);
    }
  };
  

  const handleCreateClient = (newClient: { name: string; phone: string; location: string }) => {
    const sanitizedPhone = normalizePhone(newClient.phone);

    if (!sanitizedPhone) {
      Alert.alert('Invalid phone number', 'Please provide a valid phone number before saving.');
      return;
    }

    const isDuplicate = clients.some((client) => client.phone === sanitizedPhone);
    if (isDuplicate) {
      Alert.alert('Duplicate phone number', 'This client is already in the unassigned list.');
      return;
    }

    const client: Client = {
      id: generateClientId(),
      name: newClient.name.trim(),
      phone: sanitizedPhone,
      location: newClient.location.trim() || 'Unknown',
    };
    setClients((prev) => [...prev, client]);
    setShowCreateForm(false);
  };

  const handleAssignClients = async (salesperson: Salesperson, clientsToAssign: Client[]) => {
    if (!clientsToAssign.length || !token) {
      return;
    }

    setIsAssigning(true);

    try {
      const assignmentResults = await Promise.allSettled(
        clientsToAssign.map(async (client) => {
          const response = await fetch('http://192.168.137.231:3003/api/v1/clients', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: client.name,
              phone: client.phone,
              location: client.location,
              salespersonId: salesperson._id,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data?.msg || 'Request failed');
          }

          return client;
        })
      );

      const successfulClients = assignmentResults
        .filter((result): result is PromiseFulfilledResult<Client> => result.status === 'fulfilled')
        .map((result) => result.value);

      const failedCount = assignmentResults.length - successfulClients.length;

      if (successfulClients.length) {
        const successIds = new Set(successfulClients.map((client) => client.id));
        setClients((prev) => prev.filter((client) => !successIds.has(client.id)));
        setSelectedClientIds((prev) => prev.filter((id) => !successIds.has(id)));
      }

      if (failedCount > 0) {
        Alert.alert(
          'Partial assignment',
          `${failedCount} client(s) could not be assigned. Please try again.`
        );
      } else {
        Alert.alert(
          'Assignment complete',
          `${successfulClients.length} client(s) assigned to ${salesperson.username}.`
        );
      }
    } catch (error) {
      console.error('Error assigning clients:', error);
      Alert.alert('Assignment failed', 'Unable to assign the selected clients. Please try again.');
    } finally {
      setClientsPendingAssignment([]);
      setIsAssignModalVisible(false);
      setIsAssigning(false);
    }
  };

  const handleAssignSelectedPress = () => {
    if (!selectedClients.length) return;
    openAssignModal(selectedClients);
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
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: hasSelection ? 180 : 100 },
        ]}
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

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
            activeOpacity={0.8}>
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create New Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, isUploadInProgress && styles.uploadButtonDisabled]}
            onPress={handleUploadClients}
            activeOpacity={0.8}
            disabled={isUploadInProgress}>
            <IconSymbol name="paperplane.fill" size={20} color={isUploadInProgress ? '#9BA1A6' : '#0a7ea4'} />
            <Text style={styles.uploadButtonText}>
              {isUploadInProgress ? 'Uploading…' : 'Upload Client List'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unassigned Clients List */}
        <View style={styles.clientsList}>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const isSelected = selectedClientIds.includes(client.id);
              return (
                <View
                  key={client.id}
                  style={[styles.clientCard, isSelected && styles.clientCardSelected]}>
                  <TouchableOpacity
                    style={[
                      styles.selectionToggle,
                      isSelected && styles.selectionToggleActive,
                    ]}
                    onPress={() => toggleClientSelection(client.id)}
                    activeOpacity={0.7}>
                    <IconSymbol
                      name={isSelected ? 'checkmark.circle.fill' : 'checkmark.circle'}
                      size={22}
                      color={isSelected ? '#0a7ea4' : '#9BA1A6'}
                    />
                  </TouchableOpacity>
                  <View style={styles.clientCardContent}>
                    {/* <IconSymbol name="phone.fill" size={20} color="#0a7ea4" /> */}
                    <View style={styles.clientInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.clientName}>
                        {client.name}
                      </ThemedText>
                      <Text style={styles.clientPhone}>{client.phone}</Text>
                      <Text style={styles.clientLocation}>{client.location}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.assignButton, isAssigning && styles.assignButtonDisabled]}
                    onPress={() => openAssignModal([client])}
                    activeOpacity={0.8}
                    disabled={isAssigning}>
                    <Text style={styles.assignButtonText}>
                      {isAssigning ? 'Assigning…' : 'Assign'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No unassigned clients found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {hasSelection ? (
        <View style={styles.selectionBar}>
          <View style={styles.selectionBarTextContainer}>
            <ThemedText type="defaultSemiBold" style={styles.selectionBarTitle}>
              {selectedClientIds.length} client{selectedClientIds.length > 1 ? 's' : ''} selected
            </ThemedText>
            <Text style={styles.selectionBarSubtitle}>Assign them to a salesperson</Text>
          </View>
          <View style={styles.selectionBarActions}>
            <TouchableOpacity
              style={styles.selectionBarSecondary}
              onPress={clearSelection}
              activeOpacity={0.8}>
              <Text style={styles.selectionBarSecondaryText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectionBarPrimary,
                isAssigning && styles.selectionBarPrimaryDisabled,
              ]}
              onPress={handleAssignSelectedPress}
              disabled={isAssigning}
              activeOpacity={0.8}>
              <Text style={styles.selectionBarPrimaryText}>
                {isAssigning ? 'Assigning…' : 'Assign Selected'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

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
        visible={isAssignModalVisible && clientsPendingAssignment.length > 0}
        clients={clientsPendingAssignment}
        salespersons={salespersons}
        onClose={closeAssignModal}
        onAssign={(salesperson, modalClients) => handleAssignClients(salesperson, modalClients)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF'
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
  },
  actionsRow: {
    gap: 12,
    marginBottom: 16,
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
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    backgroundColor: '#FFFFFF'
  },
  uploadButtonDisabled: {
    borderColor: '#CED4DA',
    backgroundColor: '#F5F5F5',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
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
    alignItems: 'center',
    gap: 12,
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
  clientCardSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#F0FBFF',
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectionToggle: {
    padding: 2,
  },
  selectionToggleActive: {
    transform: [{ scale: 1.02 }],
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
  clientLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  assignButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  assignButtonDisabled: {
    backgroundColor: '#94A3B8',
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
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    bottom:70,
  },
  selectionBarTextContainer: {
    flex: 1,
  },
  selectionBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  selectionBarSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectionBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionBarSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectionBarSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  selectionBarPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
  },
  selectionBarPrimaryDisabled: {
    backgroundColor: '#94A3B8',
  },
  selectionBarPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

