import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, removeToken } from '@/utils/storage';
import { getUserInfo, type UserInfo } from '@/services/api';

// Simple JWT decode function (for basic use case)
function decodeJWT(token: string): { id: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

interface User {
  id: string;
  username?: string;
  emailId?: string;
  role?: 'salesperson' | 'fieldperson' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          try {
            // Decode JWT to get user ID
            const decoded = decodeJWT(storedToken);
            if (decoded) {
              setTokenState(storedToken);
              // Fetch full user info including role
              try {
                const userInfo = await getUserInfo(storedToken);
                setUser({
                  id: userInfo.id,
                  username: userInfo.username,
                  emailId: userInfo.emailId,
                  role: userInfo.role,
                });
              } catch (error) {
                console.error('Error fetching user info:', error);
                // Fallback to just ID if API fails
                setUser({ id: decoded.id });
              }
            } else {
              await removeToken();
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            await removeToken();
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      try {
        const decoded = decodeJWT(newToken);
        if (decoded) {
          // Fetch full user info including role
          try {
            const userInfo = await getUserInfo(newToken);
            setUser({
              id: userInfo.id,
              username: userInfo.username,
              emailId: userInfo.emailId,
              role: userInfo.role,
            });
          } catch (error) {
            console.error('Error fetching user info:', error);
            // Fallback to just ID if API fails
            setUser({ id: decoded.id });
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      setUser(null);
    }
  };

  const logout = async () => {
    await removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
