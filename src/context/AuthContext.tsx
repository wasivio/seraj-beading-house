import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../firebase';
import { getRedirectResult } from 'firebase/auth';
import { AuthService } from '../services/AuthService';

interface User {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<User | null>;
  loginWithEmail: (email: string) => Promise<User | null>;
  loginWithPhone: (phone: string, otp: string) => Promise<User | null>;
  updateUserProfile: (data: { name?: string; phone?: string; photoURL?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const syncedUser = await AuthService.handleGoogleLogin();
          if (syncedUser) {
            const firestoreProfile = await AuthService.getUserProfile(syncedUser.uid);
            setCurrentUser({
              uid: syncedUser.uid,
              name: firestoreProfile?.displayName || syncedUser.displayName || 'Customer',
              email: firestoreProfile?.email || syncedUser.email || '',
              phone: firestoreProfile?.phone || syncedUser.phoneNumber || '',
              photoURL: firestoreProfile?.photoURL || syncedUser.photoURL || ''
            });
          }
        }
      } catch (err) {
        console.error('Error getting Google redirect login result:', err);
      }
    };

    checkRedirectResult();

    const unsubscribe = firebaseService.auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const user = await firebaseService.auth.signInWithGoogle();
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const user = await firebaseService.auth.signInWithEmail(email);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      const user = await firebaseService.auth.signInWithPhone(phone, otp);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; photoURL?: string }) => {
    if (!currentUser?.uid) return;
    await firebaseService.auth.updateUserProfile(currentUser.uid, data);
    setCurrentUser(prev => prev ? {
      ...prev,
      name: data.name !== undefined ? (data.name || prev.name) : prev.name,
      phone: data.phone !== undefined ? data.phone : prev.phone,
      photoURL: data.photoURL !== undefined ? data.photoURL : prev.photoURL
    } : null);
  };

  const logout = () => {
    firebaseService.auth.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    loginWithGoogle,
    loginWithEmail,
    loginWithPhone,
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
