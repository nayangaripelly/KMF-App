import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  role: 'salesperson' | 'fieldperson' | 'admin';
  createdAt: string;
}

type AssignmentRole = 'salesperson' | 'fieldperson';

interface AssignModalProps {
  visible: boolean;
  clients: Client[];
  salespersons: Salesperson[];
  fieldpersons: Salesperson[];
  onClose: () => void;
  onAssign: (assignee: Salesperson, role: AssignmentRole, clients: Client[]) => void;
}

export default function AssignModal({
  visible,
  clients,
  salespersons,
  fieldpersons,
  onClose,
  onAssign,
}: AssignModalProps) {
  if (!clients.length) return null;

  const isSingleClient = clients.length === 1;
  const primaryClient = clients[0];

  const [activeRole, setActiveRole] = React.useState<AssignmentRole>('salesperson');

  React.useEffect(() => {
    if (!visible) {
      setActiveRole('salesperson');
    }
  }, [visible]);

  const currentAssignees = activeRole === 'salesperson' ? salespersons : fieldpersons;

  const handleAssign = (assignee: Salesperson) => {
    onAssign(assignee, activeRole, clients);
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
              {isSingleClient ? 'Assign Client' : 'Assign Clients'}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#1E3A5F" />
            </TouchableOpacity>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientInfoLabel}>Assigning</Text>
            {isSingleClient ? (
              <>
                <ThemedText type="defaultSemiBold" style={styles.clientName}>
                  {primaryClient.name}
                </ThemedText>
                <Text style={styles.clientPhone}>{primaryClient.phone}</Text>
                {primaryClient.location ? (
                  <Text style={styles.clientLocation}>{primaryClient.location}</Text>
                ) : null}
              </>
            ) : (
              <>
                <ThemedText type="defaultSemiBold" style={styles.clientName}>
                  {clients.length} clients selected
                </ThemedText>
                <ScrollView style={styles.multiClientList}>
                  {clients.map((client) => (
                    <View key={client.id} style={styles.multiClientItem}>
                      <Text style={styles.multiClientName}>{client.name}</Text>
                      <Text style={styles.multiClientMeta}>{client.phone}</Text>
                      {client.location ? (
                        <Text style={styles.multiClientMeta}>{client.location}</Text>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>Assign To</Text>

          <View style={styles.roleToggleContainer}>
            {(['salesperson', 'fieldperson'] as AssignmentRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleToggle,
                  activeRole === role && styles.roleToggleActive,
                ]}
                onPress={() => setActiveRole(role)}>
                <Text
                  style={[
                    styles.roleToggleText,
                    activeRole === role && styles.roleToggleTextActive,
                  ]}>
                  {role === 'salesperson' ? 'Salesperson' : 'Field Person'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            {activeRole === 'salesperson' ? 'Select Salesperson' : 'Select Field Person'}
          </Text>

          <ScrollView style={styles.salespersonList} showsVerticalScrollIndicator={false}>
            {currentAssignees.length === 0 ? (
              <View style={styles.emptyAssignee}>
                <Text style={styles.emptyAssigneeText}>
                  {activeRole === 'salesperson'
                    ? 'No salespersons available.'
                    : 'No field persons available.'}
                </Text>
              </View>
            ) : (
              currentAssignees.map((assignee) => (
                <TouchableOpacity
                  key={assignee._id}
                  style={styles.salespersonItem}
                  onPress={() => handleAssign(assignee)}
                  activeOpacity={0.7}>
                  <Text style={styles.salespersonName}>{assignee.username}</Text>
                </TouchableOpacity>
              ))
            )}
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
    maxHeight: '100%',
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
  clientLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  multiClientList: {
    maxHeight: 180,
    marginTop: 8,
  },
  multiClientItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  multiClientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  multiClientMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleToggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleToggleActive: {
    borderColor: '#0a7ea4',
    backgroundColor: '#E3F2FD',
  },
  roleToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleToggleTextActive: {
    color: '#0a7ea4',
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
  emptyAssignee: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyAssigneeText: {
    color: '#6B7280',
    fontSize: 14,
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

