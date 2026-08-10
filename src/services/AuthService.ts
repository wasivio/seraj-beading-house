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

  async getUserProfile(uid: string) {
    if (!uid) return null;
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore:', e);
    }
    return null;
  },

  async updateUserProfile(uid: string, data: { name?: string; displayName?: string; phone?: string; photoURL?: string }) {
    if (!uid) return;
    const userDocRef = doc(db, 'users', uid);
    
    const displayName = data.displayName || data.name;
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (displayName) updateData.displayName = displayName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        await updateDoc(userDocRef, updateData);
      } else {
        await setDoc(userDocRef, {
          uid,
          displayName: displayName || auth.currentUser?.displayName || 'Customer',
          email: auth.currentUser?.email || '',
          phone: data.phone || auth.currentUser?.phoneNumber || '',
          photoURL: data.photoURL || auth.currentUser?.photoURL || '',
          status: 'active',
          role: 'customer',
          createdAt: serverTimestamp(),
          ...updateData
        });
      }

      if (auth.currentUser && displayName) {
        await updateProfile(auth.currentUser, { displayName }).catch(() => {});
      }
    } catch (err) {
      console.error('Error updating user profile in Firestore:', err);
      throw err;
    }
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
      const existing = docSnap.data();
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        displayName: existing.displayName || firebaseUser.displayName || 'Customer',
        photoURL: firebaseUser.photoURL || existing.photoURL || '',
        phone: existing.phone || firebaseUser.phoneNumber || ''
      });
    }

    return firebaseUser;
  },

  async signInWithEmail(email: string) {
    const cred = await signInAnonymously(auth);
    await updateEmail(cred.user, email).catch(() => {});
    await updateProfile(cred.user, { displayName: email.split('@')[0].toUpperCase() }).catch(() => {});
    
    const userDocRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
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
    }
    return cred.user;
  },

  async signInWithPhone(phone: string, _otp: string) {
    const cred = await signInAnonymously(auth);
    await updateProfile(cred.user, { displayName: `Phone User (${phone.slice(-4)})` }).catch(() => {});
    
    const userDocRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
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
    } else {
      await updateDoc(userDocRef, {
        phone: phone,
        lastLogin: serverTimestamp()
      });
    }
    return cred.user;
  },

  async logout() {
    await firebaseLogout();
  }
};
export type AuthServiceType = typeof AuthService;
