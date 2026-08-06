import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();
// Request additional scopes if required
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Sign-In popup failed or blocked. Falling back to redirect login flow...', error);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (redirectErr) {
      console.error('Firebase Google Redirect Sign-In error:', redirectErr);
      throw redirectErr;
    }
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out error:', error);
    throw error;
  }
};

export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
