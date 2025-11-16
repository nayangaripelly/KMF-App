import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { changePassword } from '@/services/api';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.username) {
      const names = user.username.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.emailId) {
      return user.emailId.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (user?.role === 'admin') return 'Admin Account';
    if (user?.role === 'salesperson') return 'Salesperson Account';
    if (user?.role === 'fieldperson') return 'Fieldperson Account';
    return 'User Account';
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (currentPassword.trim() && newPassword.trim() === currentPassword.trim()) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for button enable/disable
  const isFormValid = (): boolean => {
    return (
      currentPassword.trim().length > 0 &&
      newPassword.trim().length >= 8 &&
      confirmPassword.trim().length > 0 &&
      newPassword === confirmPassword &&
      newPassword !== currentPassword
    );
  };

  const handleChangePassword = async () => {
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    if (!token) {
      Alert.alert('Error', 'You must be logged in to change your password');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(
        {
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        },
        token
      );

      setSuccessMessage('Password updated successfully!');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Failed to update password. Please try again.';
      setErrorMessage(errorMsg);
      // Auto-dismiss error message after 3 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      "Are you sure you want to logout? You'll need to login again to access your account.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('[PROFILE] User logout initiated');
              // Clear auth state
              await logout();
              console.log('[PROFILE] User logged out successfully, redirecting to login...');
              // Reset navigation stack and navigate to login
              router.replace('/login');
            } catch (error) {
              console.error('[PROFILE] Logout error:', error);
              // Even if logout fails, clear local data and navigate to login
              await logout();
              console.log('[PROFILE] User logged out (fallback), redirecting to login...');
              router.replace('/login');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F4FF' }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <IconSymbol name="chevron.left" size={24} color="#1E3A5F" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Profile
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* User Info Section */}
          <ThemedView style={styles.userInfoCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
            </View>
            <ThemedText style={styles.userName}>{user?.username || 'User'}</ThemedText>
            <ThemedText style={styles.userRole}>{getRoleDisplayName()}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.emailId || ''}</ThemedText>
          </ThemedView>

          {/* Change Password Section */}
          <ThemedView style={styles.passwordCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Change Password
            </ThemedText>

            {/* Success Message */}
            {successMessage ? (
              <View style={styles.successMessageContainer}>
                <ThemedText style={styles.successMessage}>{successMessage}</ThemedText>
              </View>
            ) : null}

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorMessageContainer}>
                <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
              </View>
            ) : null}

            {/* Current Password */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Current Password</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: '#F5F5F5',
                      color: textColor,
                      borderColor: errors.currentPassword
                        ? '#EF4444'
                        : '#E0E0E0',
                    },
                  ]}
                  placeholder="Enter current password"
                  placeholderTextColor={'#9BA1A6'}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (errors.currentPassword) {
                      setErrors({ ...errors, currentPassword: undefined });
                    }
                  }}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  activeOpacity={0.7}>
                  <IconSymbol
                    name={showCurrentPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword ? (
                <ThemedText style={styles.errorText}>{errors.currentPassword}</ThemedText>
              ) : null}
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>New Password</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: '#F5F5F5',
                      color: textColor,
                      borderColor: errors.newPassword
                        ? '#EF4444'
                        : '#E0E0E0',
                    },
                  ]}
                  placeholder="Enter new password"
                  placeholderTextColor={'#9BA1A6'}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) {
                      setErrors({ ...errors, newPassword: undefined });
                    }
                  }}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  activeOpacity={0.7}>
                  <IconSymbol
                    name={showNewPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword ? (
                <ThemedText style={styles.errorText}>{errors.newPassword}</ThemedText>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: '#F5F5F5',
                      color: textColor,
                      borderColor: errors.confirmPassword
                        ? '#EF4444'
                        : '#E0E0E0',
                    },
                  ]}
                  placeholder="Confirm new password"
                  placeholderTextColor={'#9BA1A6'}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined });
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}>
                  <IconSymbol
                    name={showConfirmPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
              ) : null}
            </View>

            {/* Update Password Button */}
            <TouchableOpacity
              style={[
                styles.updateButton,
                (isLoading || !isFormValid()) && styles.updateButtonDisabled,
              ]}
              onPress={handleChangePassword}
              activeOpacity={0.8}
              disabled={isLoading || !isFormValid()}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.updateButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Logout Section */}
          <ThemedView style={styles.logoutCard}>
            <ThemedText style={styles.logoutText}>
              Click the button below to logout from your account.
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                isLoggingOut && styles.logoutButtonDisabled,
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
              disabled={isLoggingOut}>
              {isLoggingOut ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  passwordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 16,
  },
  successMessageContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successMessage: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
  },
  errorMessageContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 14,
    borderWidth: 2,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  updateButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  logoutText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  logoutButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

