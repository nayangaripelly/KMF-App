import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createLead, createMeetLog, getClients, type Client, type MeetStatus } from '@/services/api';
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

const MEET_STATUSES: MeetStatus[] = ['met', 'notmet', 'meetagain'];

export default function MeetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [loanType, setLoanType] = useState<'personal' | 'business' | 'student' | 'home' | ''>('');
  const [loanStatus, setLoanStatus] = useState<'hot' | 'warm' | 'cold' | ''>('');
  const [meetStatus, setMeetStatus] = useState<MeetStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [distanceTravelled, setDistanceTravelled] = useState('');

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
      console.error('[MEET DETAIL] Error loading client:', error);
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

    if (!meetStatus) {
      Alert.alert('Error', 'Please select a meet status');
      return;
    }

    const parsedDistance = distanceTravelled.trim() ? Number(distanceTravelled) : undefined;
    if (parsedDistance !== undefined && (Number.isNaN(parsedDistance) || parsedDistance < 0)) {
      Alert.alert('Error', 'Distance travelled must be a positive number');
      return;
    }

    setIsSaving(true);
    try {
      const meetTime = new Date().toISOString();

      if (loanType && loanStatus) {
        await createLead(
          {
            clientId: client._id,
            loanType,
            loanStatus,
            userId: user.id,
          },
          token
        );
      }

      await createMeetLog(
        {
          clientId: client._id,
          fieldPersonId: user.id,
          meetStatus,
          distanceTravelled: parsedDistance,
          timestamp: meetTime,
          notes: notes || undefined,
        },
        token
      );

      router.back();
      setTimeout(() => {
        Alert.alert('Success', 'Meet details saved successfully!');
      }, 250);
    } catch (error) {
      console.error('[MEET DETAIL] Error saving meet data:', error);
      Alert.alert('Error', 'Failed to save meet details. Please try again.');
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

  const loanTypes: Array<'personal' | 'business' | 'student' | 'home'> = ['personal', 'business', 'student', 'home'];
  const loanStatuses: Array<'hot' | 'warm' | 'cold'> = ['hot', 'warm', 'cold'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Meet Details
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        <TouchableOpacity style={[styles.callButton, { backgroundColor: '#34C759' }]} onPress={handleCall}>
          <IconSymbol name="phone.fill" size={24} color="#FFFFFF" />
          <ThemedText style={styles.callButtonText}>Call Client</ThemedText>
        </TouchableOpacity>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Loan Type</ThemedText>
          <View style={styles.selectionContainer}>
            {loanTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.selectionButton,
                  {
                    backgroundColor: loanType === type ? '#0a7ea4' : '#F5F5F5',
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
                      backgroundColor: loanStatus === status ? statusColors[status] : statusBgColors[status],
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

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Meet Notes (Optional)</ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: '#F5F5F5',
                color: textColor,
                borderColor: '#E0E0E0',
              },
            ]}
            placeholder="Add any notes about this meet..."
            placeholderTextColor="#9BA1A6"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Meet Status</ThemedText>
          <View style={styles.selectionContainer}>
            {MEET_STATUSES.map((status) => {
              const label = status === 'meetagain' ? 'Meet Again' : status === 'met' ? 'Met' : 'Not Met';
              const statusColors: Record<MeetStatus, string> = {
                met: '#34C759',
                notmet: '#FF3B30',
                meetagain: '#FF9500',
              };
              const statusBgColors: Record<MeetStatus, string> = {
                met: '#E8F5E9',
                notmet: '#FFEBEE',
                meetagain: '#FFF3E0',
              };

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.selectionButton,
                    {
                      backgroundColor: meetStatus === status ? statusColors[status] : statusBgColors[status],
                      borderColor: meetStatus === status ? statusColors[status] : '#E0E0E0',
                    },
                  ]}
                  onPress={() => setMeetStatus(status)}>
                  <ThemedText
                    style={[
                      styles.selectionButtonText,
                      { color: meetStatus === status ? '#FFFFFF' : statusColors[status] },
                    ]}>
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Distance Travelled (km)</ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: '#F5F5F5',
                color: textColor,
                borderColor: '#E0E0E0',
              },
            ]}
            placeholder="e.g. 12.5"
            placeholderTextColor="#9BA1A6"
            keyboardType="numeric"
            value={distanceTravelled}
            onChangeText={setDistanceTravelled}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: '#0a7ea4',
              ...(isSaving && { opacity: 0.7 }),
            },
          ]}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Meet Details</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backIcon: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#2A4B5E',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }),
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectionButton: {
    flexGrow: 1,
    minWidth: '45%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

