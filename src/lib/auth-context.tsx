import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithStudentId: (studentId: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'AdminPass123',
    user: {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  },
  'voter@example.com': {
    password: 'VoterPass123',
    user: {
      id: 'voter-1',
      name: 'John Voter',
      email: 'voter@example.com',
      studentId: 'STU001',
      role: 'voter',
      hasVoted: false,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
  },
  'candidate@example.com': {
    password: 'CandidatePass123',
    user: {
      id: 'candidate-1',
      name: 'Jane Candidate',
      email: 'candidate@example.com',
      role: 'candidate',
      createdAt: new Date().toISOString(),
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const storedToken = sessionStorage.getItem('auth_token');
    const storedUser = sessionStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[email.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    if (mockUser.user.role !== role) {
      throw new Error(`This account is not registered as a ${role}`);
    }

    const token = `mock-token-${Date.now()}`;
    
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(mockUser.user));

    setState({
      user: mockUser.user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const loginWithStudentId = useCallback(async (studentId: string, otp: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock: accept any 6-digit OTP for demo
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
    }

    const mockVoter: User = {
      id: `voter-${studentId}`,
      name: 'Student Voter',
      studentId,
      role: 'voter',
      hasVoted: false,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    };

    const token = `mock-token-${Date.now()}`;
    
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(mockVoter));

    setState({
      user: mockVoter,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      sessionStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      return { ...prev, user: updatedUser };
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
