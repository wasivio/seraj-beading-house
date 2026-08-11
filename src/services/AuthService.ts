import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updatePassword, 
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs,
  limit 
} from 'firebase/firestore';
import { 
  normalizeIndianPhone, 
  phoneToAuthIdentifier, 
  validatePasswordPolicy 
} from '../utils/phoneUtils';
import type { User } from '../types';

export const AuthService = {
  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  },

  /**
   * Fetch customer profile from Firestore users/{uid}
   */
  async getUserProfile(uid: string): Promise<User | null> {
    if (!uid) return null;
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          uid,
          name: data.name || data.displayName || 'Customer',
          displayName: data.displayName || data.name || 'Customer',
          mobileNumber: data.mobileNumber || '',
          normalizedPhone: data.normalizedPhone || data.phone || '',
          countryCode: data.countryCode || '+91',
          phone: data.normalizedPhone || data.phone || '',
          email: data.email || '',
          photoURL: data.photoURL || null,
          role: data.role || 'customer',
          status: data.status || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastLoginAt: data.lastLoginAt
        };
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore:', e);
    }
    return null;
  },

  /**
   * Register a new customer with Name + Indian Mobile Number + Password
   * No OTP requirement.
   */
  async registerWithPhonePassword(name: string, phone: string, password: string): Promise<User> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Please enter your full name.');
    }

    // 1. Validate and Normalize Indian Phone Number
    const phoneResult = normalizeIndianPhone(phone);
    if (!phoneResult.isValid) {
      throw new Error(phoneResult.error || 'Please enter a valid 10-digit Indian mobile number.');
    }

    // 2. Validate Password Policy
    const passResult = validatePasswordPolicy(password);
    if (!passResult.isValid) {
      throw new Error(passResult.errors[0]);
    }

    // 3. Duplicate Phone Check in Firestore users collection
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('normalizedPhone', '==', phoneResult.normalizedPhone),
        limit(1)
      );
      const duplicateSnap = await getDocs(q);
      if (!duplicateSnap.empty) {
        throw new Error('An account with this mobile number already exists. Please login.');
      }
    } catch (checkErr: any) {
      if (checkErr.message?.includes('already exists')) {
        throw checkErr;
      }
      // If Firestore index or network query is pending, continue to auth unique check
    }

    // 4. Create Authentication Account
    const authIdentifier = phoneToAuthIdentifier(phoneResult.normalizedPhone);
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, authIdentifier, password);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error('An account with this mobile number already exists. Please login.');
      }
      if (authErr.code === 'auth/weak-password') {
        throw new Error('Password must be at least 8 characters long with numbers and letters.');
      }
      throw new Error(authErr.message || 'Failed to create account. Please try again.');
    }

    // 5. Update Auth Profile
    await updateProfile(cred.user, { displayName: trimmedName }).catch(() => {});

    // 6. Create Customer Document in Firestore users/{uid}
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userPayload: Record<string, any> = {
      uid: cred.user.uid,
      name: trimmedName,
      displayName: trimmedName,
      mobileNumber: phoneResult.mobileNumber,
      normalizedPhone: phoneResult.normalizedPhone,
      countryCode: phoneResult.countryCode,
      phone: phoneResult.normalizedPhone,
      email: '',
      photoURL: null,
      role: 'customer',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };

    await setDoc(userDocRef, userPayload, { merge: true });

    return {
      uid: cred.user.uid,
      name: trimmedName,
      displayName: trimmedName,
      mobileNumber: phoneResult.mobileNumber,
      normalizedPhone: phoneResult.normalizedPhone,
      countryCode: phoneResult.countryCode,
      phone: phoneResult.normalizedPhone,
      photoURL: null,
      role: 'customer',
      status: 'active'
    };
  },

  /**
   * Login with Indian Mobile Number + Password
   * No OTP requirement.
   */
  async loginWithPhonePassword(phone: string, password: string): Promise<User> {
    // 1. Validate & Normalize Phone
    const phoneResult = normalizeIndianPhone(phone);
    if (!phoneResult.isValid) {
      throw new Error(phoneResult.error || 'Please enter a valid 10-digit Indian mobile number.');
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    // 2. Sign In via Authentication
    const authIdentifier = phoneToAuthIdentifier(phoneResult.normalizedPhone);
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, authIdentifier, password);
    } catch (err: any) {
      // Return safe, non-revealing error message
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-email'
      ) {
        throw new Error('Mobile number or password is incorrect.');
      }
      if (err.code === 'auth/too-many-requests') {
        throw new Error('Too many login attempts. Please try again later.');
      }
      throw new Error(err.message || 'Mobile number or password is incorrect.');
    }

    // 3. Verify Account Status in Firestore
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);
    let profileData: any = {};

    if (snap.exists()) {
      profileData = snap.data();
      // Blocked account protection
      if (profileData.status === 'blocked' || profileData.status === 'suspended') {
        await signOut(auth);
        throw new Error('Your account has been temporarily blocked. Please contact support.');
      }

      // Update last login timestamp
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(() => {});
    } else {
      // If Firestore profile was missing, hydrate it
      profileData = {
        uid: cred.user.uid,
        name: cred.user.displayName || 'Customer',
        displayName: cred.user.displayName || 'Customer',
        mobileNumber: phoneResult.mobileNumber,
        normalizedPhone: phoneResult.normalizedPhone,
        countryCode: phoneResult.countryCode,
        phone: phoneResult.normalizedPhone,
        photoURL: null,
        role: 'customer',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      await setDoc(userDocRef, profileData, { merge: true });
    }

    return {
      uid: cred.user.uid,
      name: profileData.name || profileData.displayName || cred.user.displayName || 'Customer',
      displayName: profileData.displayName || profileData.name || 'Customer',
      mobileNumber: profileData.mobileNumber || phoneResult.mobileNumber,
      normalizedPhone: profileData.normalizedPhone || phoneResult.normalizedPhone,
      countryCode: profileData.countryCode || '+91',
      phone: profileData.normalizedPhone || profileData.phone || phoneResult.normalizedPhone,
      photoURL: profileData.photoURL || null,
      role: profileData.role || 'customer',
      status: profileData.status || 'active'
    };
  },

  /**
   * Change Password inside Profile Security
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Please login to change your password.');
    }

    const passResult = validatePasswordPolicy(newPassword);
    if (!passResult.isValid) {
      throw new Error(passResult.errors[0]);
    }

    // Re-authenticate with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (authErr: any) {
      throw new Error('Current password is incorrect.');
    }

    // Update password
    await updatePassword(user, newPassword);

    // Update timestamp in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      updatedAt: serverTimestamp()
    }).catch(() => {});
  },

  /**
   * Update Profile Details (Name, Phone, etc.)
   */
  async updateUserProfile(uid: string, data: { name?: string; displayName?: string; phone?: string; photoURL?: string }) {
    if (!uid) return;
    const userDocRef = doc(db, 'users', uid);
    
    const displayName = data.displayName || data.name;
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp()
    };

    if (displayName) {
      updateData.name = displayName;
      updateData.displayName = displayName;
    }
    if (data.phone !== undefined) {
      const norm = normalizeIndianPhone(data.phone);
      if (norm.isValid) {
        updateData.mobileNumber = norm.mobileNumber;
        updateData.normalizedPhone = norm.normalizedPhone;
        updateData.phone = norm.normalizedPhone;
        updateData.countryCode = norm.countryCode;
      } else {
        updateData.phone = data.phone;
      }
    }
    if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        await updateDoc(userDocRef, updateData);
      } else {
        await setDoc(userDocRef, {
          uid,
          name: displayName || 'Customer',
          displayName: displayName || 'Customer',
          phone: data.phone || '',
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

  async logout() {
    await signOut(auth);
  }
};
export type AuthServiceType = typeof AuthService;
