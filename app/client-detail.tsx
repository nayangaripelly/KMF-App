import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createCallLog, createLead, getClients, type Client } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [loanType, setLoanType] = useState<'personal' | 'business' | 'student' | 'home' | ''>('');
  const [loanStatus, setLoanStatus] = useState<'hot' | 'warm' | 'cold' | ''>('');
  const [notes, setNotes] = useState('');
  
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (id && user?.id && token) {
      loadClient();
    }
  }, [id, user?.id, token]);

  const loadClient = async () => {
    if (!user?.id || !token || !id) return;

    try {
      setIsLoading(true);
      const clients = await getClients(user.id, token);
      const foundClient = clients.find((c) => c._id === id);
      if (foundClient) {
        setClient(foundClient);
      }
    } catch (error) {
      console.error('Error loading client:', error);
      Alert.alert('Error', 'Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    if (!client?.phoneNo) return;

    const phoneUrl = `tel:${client.phoneNo.replace(/[^0-9]/g, '')}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    });
  };

  const handleSave = async () => {
    if (!client || !user?.id || !token) return;

    if (!loanType || !loanStatus) {
      Alert.alert('Error', 'Please select both loan type and interest status');
      return;
    }

    if (!user?.id || !token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const calledTime = new Date().toISOString();
      const duration = '5 min 30 sec'; // Mock duration for now
      
      // Determine call type based on loan status
      const callType: 'incoming' | 'outgoing' | 'missed' = 
        loanStatus === 'hot' ? 'outgoing' : loanStatus === 'warm' ? 'outgoing' : 'missed';
      
      // Determine call log status based on loan status
      const callLogStatus: 'connected' | 'rejected' | 'followup' | 'missed' =
        loanStatus === 'hot' ? 'connected' : loanStatus === 'warm' ? 'followup' : 'rejected';
      
      console.log('[CLIENT DETAIL] Saving client data:', {
        clientId: client._id,
        userId: user.id,
        loanType,
        loanStatus,
        callType,
        callLogStatus,
        notes,
      });

      // Create lead
      await createLead(
        {
          clientId: client._id,
          loanType,
          loanStatus,
          userId: user.id,
        },
        token
      );

      // Create call log
      await createCallLog(
        {
          clientId: client._id,
          status: callLogStatus,
          callType,
          duration,
          calledTime,
          note: notes || undefined,
          userId: user.id,
        },
        token
      );

      console.log('[CLIENT DETAIL] Data saved successfully, navigating back...');

      // Navigate back and refresh parent screens
      router.back();
      
      // Small delay to ensure navigation completes
      setTimeout(() => {
        Alert.alert('Success', 'Client data saved successfully!');
      }, 300);
    } catch (error) {
      console.error('Error saving client data:', error);
      Alert.alert('Error', 'Failed to save client data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ThemedText>Client not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const loanTypes: Array<'personal' | 'business' | 'student' | 'home'> = [
    'personal',
    'business',
    'student',
    'home',
  ];

  const loanStatuses: Array<'hot' | 'warm' | 'cold'> = ['hot', 'warm', 'cold'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Client Details
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: '#FFFFFF',
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
          <ThemedText type="defaultSemiBold" style={styles.clientName}>
            {client.name}
          </ThemedText>
          <View style={styles.infoRow}>
            <IconSymbol name="phone.fill" size={20} color="#FF69B4" />
            <ThemedText style={styles.infoText}>{client.phoneNo}</ThemedText>
          </View>
          {client.location && (
            <View style={styles.infoRow}>
              <IconSymbol name="location.fill" size={20} color="#FF69B4" />
              <ThemedText style={styles.infoText}>{client.location}</ThemedText>
            </View>
          )}
        </View>

        {/* Call Button */}
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#34C759' }]}
          onPress={handleCall}>
          <IconSymbol name="phone.fill" size={24} color="#FFFFFF" />
          <ThemedText style={styles.callButtonText}>Make Call</ThemedText>
        </TouchableOpacity>

        {/* Loan Type Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Loan Type</ThemedText>
          <View style={styles.selectionContainer}>
            {loanTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.selectionButton,
                  {
                    backgroundColor:
                      loanType === type
                        ? '#0a7ea4'
                          : '#F5F5F5',
                    borderColor: loanType === type ? '#0a7ea4' : '#E0E0E0',
                  },
                ]}
                onPress={() => setLoanType(type)}>
                <ThemedText
                  style={[
                    styles.selectionButtonText,
                    { color: loanType === type ? '#FFFFFF' : textColor },
                  ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interest Status Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Interest Status</ThemedText>
          <View style={styles.selectionContainer}>
            {loanStatuses.map((status) => {
              const statusColors: Record<string, string> = {
                hot: '#F44336',
                warm: '#FF9800',
                cold: '#2196F3',
              };
              const statusBgColors: Record<string, string> = {
                hot: '#FFEBEE',
                warm: '#FFF3E0',
                cold: '#E3F2FD',
              };

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.selectionButton,
                    {
                      backgroundColor:
                        loanStatus === status
                          ? statusColors[status]
                          : statusBgColors[status],
                      borderColor: loanStatus === status ? statusColors[status] : '#E0E0E0',
                    },
                  ]}
                  onPress={() => setLoanStatus(status)}>
                  <ThemedText
                    style={[
                      styles.selectionButtonText,
                      { color: loanStatus === status ? '#FFFFFF' : statusColors[status] },
                    ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notes (Optional)</ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: '#F5F5F5',
                color: textColor,
                borderColor: '#E0E0E0',
              },
            ]}
            placeholder="Add any notes about this client..."
            placeholderTextColor="#9BA1A6"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: '#0a7ea4',
              ...(Platform.OS === 'web'
                ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
                : {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }),
            },
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          )}
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  headerSpacer: {
    width: 40,
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
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  callButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 12,
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    marginTop: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

