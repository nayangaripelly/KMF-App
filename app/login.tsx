import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { login } from '@/services/api';
import { saveToken } from '@/utils/storage';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleLogin = async () => {
    if (!emailId.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(emailId.trim(), password);
      if (response?.token) {
        await saveToken(response.token);
        setToken(response.token); // Update context
        // Clear form after successful login
        setEmailId('');
        setPassword('');
        setIsLoading(false);
        
        // Redirect will be handled by index.tsx based on role
        router.replace('/');
        return;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your connection and try again.';
      Alert.alert('Login Failed', errorMessage);
      console.error('Login error:', error);
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
                Welcome Back!
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Sign in to continue
              </ThemedText>
            </ThemedView>

            {/* Form */}
            <ThemedView style={styles.form}>
              {/* Email Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: '#F5F5F5',
                      color: textColor,
                      borderColor:  '#E0E0E0',
                    },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor='#9BA1A6'
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
                      backgroundColor:  '#F5F5F5',
                      color: textColor,
                      borderColor: '#E0E0E0',
                    },
                  ]}
                  placeholder="Enter password"
                  placeholderTextColor= '#9BA1A6'
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <ThemedText style={[styles.forgotPasswordText, { color: tintColor }]}>
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: '#FFFFFF' },
                  isLoading && styles.loginButtonDisabled,
                  isLoading && { pointerEvents: 'none' },
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <ThemedView style={styles.signupContainer}>
                <ThemedText style={styles.signupText}>Don't have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <ThemedText style={[styles.signupLink, { color: tintColor }]}>
                    Sign Up
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
