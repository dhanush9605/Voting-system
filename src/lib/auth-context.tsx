import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types';
import api from './api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole, faceDescriptor?: number[]) => Promise<void>;
  loginWithStudentId: (studentId: string, password: string, faceDescriptor?: number[]) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null, // Token is handled via httpOnly cookie
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setState({
        user: data,
        token: 'cookie', // Placeholder
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string, role: UserRole, faceDescriptor?: number[]) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, faceDescriptor });

      if (data.role !== role && role !== 'admin') { // Admin can login anywhere usually, or restrict
        // For strict role checking:
        if (data.role !== role) {
          await api.post('/auth/logout');
          throw new Error(`This account is not registered as a ${role}`);
        }
      }

      setState({
        user: data,
        token: 'cookie',
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      // Pass the full error object so components can check for status codes (e.g. 428)
      throw error;
    }
  }, []);

  const loginWithStudentId = useCallback(async (studentId: string, password: string, faceDescriptor?: number[]) => {
    try {
      const { data } = await api.post('/auth/login', { studentId, password, faceDescriptor });

      setState({
        user: data,
        token: 'cookie',
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      return { ...prev, user: { ...prev.user, ...updates } };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithStudentId, logout, updateUser }}>
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
