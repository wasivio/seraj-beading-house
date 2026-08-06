import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const ProfileService = {
  async getProfile(userId: string) {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data();
  },

  async updateProfile(userId: string, data: { displayName?: string; phone?: string; photoURL?: string }) {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
  }
};
export type ProfileServiceType = typeof ProfileService;
