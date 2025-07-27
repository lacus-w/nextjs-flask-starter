'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from './types';
import { api } from './api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    role?: 'teacher' | 'student';
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        api.setToken(token);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login({ username, password });
      const newAuthState = {
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role?: 'teacher' | 'student';
  }) => {
    try {
      const response = await api.register(userData);
      const newAuthState = {
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loading,
      }}
    >
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