import { signInWithGoogle as firebaseSignInWithGoogle, logout as firebaseLogout } from '../auth';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, updateEmail, updateProfile } from 'firebase/auth';

export const AuthService = {
  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  },

  async handleGoogleLogin() {
    const firebaseUser = await firebaseSignInWithGoogle();
    if (!firebaseUser) return null;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(userDocRef);

    const profileData = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Customer',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      phone: firebaseUser.phoneNumber || '',
      lastLogin: serverTimestamp(),
      provider: 'google.com',
      status: 'active',
      role: 'customer'
    };

    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp()
      });
    } else {
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        displayName: firebaseUser.displayName || docSnap.data().displayName,
        photoURL: firebaseUser.photoURL || docSnap.data().photoURL
      });
    }

    return firebaseUser;
  },

  async signInWithEmail(email: string) {
    const cred = await signInAnonymously(auth);
    await updateEmail(cred.user, email).catch(() => {});
    await updateProfile(cred.user, { displayName: email.split('@')[0].toUpperCase() }).catch(() => {});
    
    const userDocRef = doc(db, 'users', cred.user.uid);
    await setDoc(userDocRef, {
      uid: cred.user.uid,
      displayName: cred.user.displayName || 'Customer',
      email: email,
      photoURL: '',
      phone: '',
      lastLogin: serverTimestamp(),
      provider: 'email',
      status: 'active',
      role: 'customer',
      createdAt: serverTimestamp()
    });
    return cred.user;
  },

  async signInWithPhone(phone: string, _otp: string) {
    const cred = await signInAnonymously(auth);
    await updateProfile(cred.user, { displayName: `Phone User (${phone.slice(-4)})` }).catch(() => {});
    
    const userDocRef = doc(db, 'users', cred.user.uid);
    await setDoc(userDocRef, {
      uid: cred.user.uid,
      displayName: cred.user.displayName || 'Phone Customer',
      email: '',
      photoURL: '',
      phone: phone,
      lastLogin: serverTimestamp(),
      provider: 'phone',
      status: 'active',
      role: 'customer',
      createdAt: serverTimestamp()
    });
    return cred.user;
  },

  async logout() {
    await firebaseLogout();
  }
};
export type AuthServiceType = typeof AuthService;
