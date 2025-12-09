import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { signup } from '@/services/api';
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

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'salesperson' | 'fieldperson' | 'admin'>('salesperson');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleSignup = async () => {
    if (!username.trim() || !emailId.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!role) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signup(username.trim(), emailId.trim(), password, role);
      if (response?.msg) {
        // Clear form
        setUsername('');
        setEmailId('');
        setPassword('');
        setIsLoading(false);
        
        // Redirect immediately to login page without alert to avoid aria-hidden issues
        router.replace('/login');
        return;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Signup failed. Please check your connection and try again.';
      Alert.alert('Signup Failed', errorMessage);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.content}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Create Account
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Sign up to get started
              </ThemedText>
            </ThemedView>

            {/* Form */}
            <ThemedView style={styles.form}>
              {/* Username Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor:  '#F5F5F5',
                      color: textColor,
                      borderColor:  '#E0E0E0',
                    },
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor={ '#9BA1A6'}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!isLoading}
                />
              </ThemedView>

              {/* Email Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor:  '#F5F5F5',
                      color: textColor,
                      borderColor:  '#E0E0E0',
                    },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={'#9BA1A6'}
                  value={emailId}
                  onChangeText={setEmailId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </ThemedView>

              {/* Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: '#F5F5F5',
                      color: textColor,
                      borderColor:  '#E0E0E0',
                    },
                  ]}
                  placeholder="Create password"
                  placeholderTextColor={ '#9BA1A6'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  <ThemedText style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {/* Role Selection */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Role</ThemedText>
                <View style={styles.roleContainer}>
                  {(['salesperson', 'fieldperson', 'admin'] as const).map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor:
                            role === roleOption
                              ? '#E0E0E0'
                              : '#F5F5F5',
                          borderColor:  '#E0E0E0',
                        },
                      ]}
                      onPress={() => setRole(roleOption)}
                      disabled={isLoading}>
                      <ThemedText
                        style={[
                          styles.roleButtonText,
                          role === roleOption && styles.roleButtonTextActive,
                        ]}>
                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ThemedView>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  { backgroundColor: '#FFFFFF' },
                  isLoading && styles.signupButtonDisabled,
                  isLoading && { pointerEvents: 'none' },
                ]}
                onPress={handleSignup}
                activeOpacity={0.8}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <ThemedView style={styles.loginContainer}>
                <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <ThemedText style={[styles.loginLink, { color: tintColor }]}>
                    Sign In
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 40,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  signupButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    // Use boxShadow for web, shadow properties for native
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
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  roleButton: {
    flex: 1,
    minWidth: 100,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleButtonTextActive: {
    fontWeight: 'bold',
  },
});
