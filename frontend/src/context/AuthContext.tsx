'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../services/api';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hms_token');
      const storedUser = localStorage.getItem('hms_user');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        // Verify token with backend
        try {
          const freshUser = await api.auth.getMe();
          let profileId: string | undefined;
          if (freshUser.role === 'PATIENT') profileId = freshUser.patientProfile?.id;
          else if (freshUser.role === 'DOCTOR') profileId = freshUser.doctorProfile?.id;
          else if (freshUser.role === 'NURSE') profileId = freshUser.nurseProfile?.id;

          const updatedUser = {
            id: freshUser.id,
            email: freshUser.email,
            role: freshUser.role,
            firstName: freshUser.firstName,
            lastName: freshUser.lastName,
            avatarUrl: freshUser.avatarUrl,
            profileId
          };

          setUser(updatedUser);
          localStorage.setItem('hms_user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Auth verification failed, logging out', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Redirect based on role
      redirectBasedOnRole(data.user.role);
      
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const data = await api.auth.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const freshUser = await api.auth.getMe();
      let profileId: string | undefined;
      if (freshUser.role === 'PATIENT') profileId = freshUser.patientProfile?.id;
      else if (freshUser.role === 'DOCTOR') profileId = freshUser.doctorProfile?.id;
      else if (freshUser.role === 'NURSE') profileId = freshUser.nurseProfile?.id;

      const updatedUser = {
        id: freshUser.id,
        email: freshUser.email,
        role: freshUser.role,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        avatarUrl: freshUser.avatarUrl,
        profileId
      };
      setUser(updatedUser);
      localStorage.setItem('hms_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user details:', error);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        router.push('/dashboard/admin');
        break;
      case 'DOCTOR':
        router.push('/dashboard/doctor');
        break;
      case 'NURSE':
        router.push('/dashboard/nurse');
        break;
      case 'PATIENT':
        router.push('/dashboard/patient');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
