import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Salesperson {
  id: string;
  name: string;
}

interface AssignModalProps {
  visible: boolean;
  client: Client | null;
  salespersons: Salesperson[];
  onClose: () => void;
  onAssign: (salesperson: Salesperson) => void;
}

export default function AssignModal({
  visible,
  client,
  salespersons,
  onClose,
  onAssign,
}: AssignModalProps) {
  if (!client) return null;

  const handleAssign = (salesperson: Salesperson) => {
    onAssign(salesperson);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Assign Client
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#1E3A5F" />
            </TouchableOpacity>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientInfoLabel}>Assigning to</Text>
            <ThemedText type="defaultSemiBold" style={styles.clientName}>
              {client.name}
            </ThemedText>
            <Text style={styles.clientPhone}>{client.phone}</Text>
          </View>

          <Text style={styles.sectionTitle}>Select Salesperson</Text>

          <ScrollView style={styles.salespersonList} showsVerticalScrollIndicator={false}>
            {salespersons.map((salesperson) => (
              <TouchableOpacity
                key={salesperson.id}
                style={styles.salespersonItem}
                onPress={() => handleAssign(salesperson)}
                activeOpacity={0.7}>
                <Text style={styles.salespersonName}>{salesperson.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 24,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  closeButton: {
    padding: 8,
  },
  clientInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  clientInfoLabel: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 4,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  salespersonList: {
    maxHeight: 200,
    marginBottom: 24,
  },
  salespersonItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  salespersonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  cancelButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
});

