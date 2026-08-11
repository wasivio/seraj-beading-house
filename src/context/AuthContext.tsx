import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { AuthService } from '../services/AuthService';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<User>;
  register: (name: string, phone: string, pass: string) => Promise<User>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; phone?: string; photoURL?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsLoading(false);
      } else {
        try {
          const profile = await AuthService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            setCurrentUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Customer',
              displayName: firebaseUser.displayName || 'Customer',
              phone: firebaseUser.phoneNumber || '',
              mobileNumber: '',
              normalizedPhone: firebaseUser.phoneNumber || '',
              countryCode: '+91',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || null,
              role: 'customer',
              status: 'active'
            });
          }
        } catch (e) {
          console.warn('Error loading user profile on auth state change:', e);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (name: string, phone: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await AuthService.registerWithPhonePassword(name, phone, pass);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await AuthService.loginWithPhonePassword(phone, pass);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPass: string, newPass: string): Promise<void> => {
    await AuthService.changePassword(currentPass, newPass);
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; photoURL?: string }) => {
    if (!currentUser?.uid) return;
    await AuthService.updateUserProfile(currentUser.uid, data);
    setCurrentUser(prev => prev ? {
      ...prev,
      name: data.name !== undefined ? (data.name || prev.name) : prev.name,
      displayName: data.name !== undefined ? (data.name || prev.displayName) : prev.displayName,
      phone: data.phone !== undefined ? data.phone : prev.phone,
      photoURL: data.photoURL !== undefined ? data.photoURL : prev.photoURL
    } : null);
  };

  const logout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    changePassword,
    updateUserProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
