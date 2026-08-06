import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Address } from '../types';

export const AddressService = {
  async getAddresses(userId: string): Promise<Address[]> {
    const docRef = doc(db, 'addresses', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return [];
    return snap.data().items || [];
  },

  async saveAddresses(userId: string, items: Address[]): Promise<void> {
    const docRef = doc(db, 'addresses', userId);
    await setDoc(docRef, { items });
  },

  async saveAddress(userId: string, address: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
    const addresses = await this.getAddresses(userId);
    let updated = [...addresses];

    const finalAddress: Address = {
      ...address,
      id: address.id || `addr-${Date.now()}`
    };

    const idx = updated.findIndex(a => a.id === finalAddress.id);
    if (idx > -1) {
      updated[idx] = finalAddress;
    } else {
      updated.push(finalAddress);
    }

    if (finalAddress.isDefault) {
      updated = updated.map(a => a.id === finalAddress.id ? a : { ...a, isDefault: false });
    }

    await this.saveAddresses(userId, updated);
    return finalAddress;
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const addresses = await this.getAddresses(userId);
    const updated = addresses.filter(a => a.id !== addressId);
    await this.saveAddresses(userId, updated);
  }
};
export type AddressServiceType = typeof AddressService;
