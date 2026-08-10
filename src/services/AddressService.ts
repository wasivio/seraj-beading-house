import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Address } from '../types';

export interface PincodeLookupResult {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

/**
 * Strips all undefined fields recursively so Firestore never throws unsupported field value error.
 */
function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData) as unknown as T;
  }
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = typeof value === 'object' && value !== null
        ? cleanFirestoreData(value)
        : value;
    }
  }
  return cleaned as T;
}

export const AddressService = {
  /**
   * Fetch all saved addresses for a user from Firestore
   */
  async getAddresses(userId: string): Promise<Address[]> {
    if (!userId) return [];
    try {
      const docRef = doc(db, 'addresses', userId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return [];
      return snap.data().items || [];
    } catch (e) {
      console.error('Error fetching addresses from Firestore:', e);
      return [];
    }
  },

  /**
   * Overwrite address list in Firestore for user
   */
  async saveAddresses(userId: string, items: Address[]): Promise<void> {
    if (!userId) return;
    const docRef = doc(db, 'addresses', userId);
    const sanitizedItems = cleanFirestoreData(items);
    await setDoc(docRef, { 
      items: sanitizedItems, 
      updatedAt: new Date().toISOString() 
    });
  },

  /**
   * Create or update a single address
   */
  async saveAddress(userId: string, address: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
    const addresses = await this.getAddresses(userId);
    let updated = [...addresses];
    const now = new Date().toISOString();

    const rawAddress: Record<string, any> = {
      id: address.id || `addr-${Date.now()}`,
      userId,
      name: address.name || '',
      phone: address.phone || '',
      addressLine: address.addressLine || '',
      city: address.city || 'Hooghly',
      state: address.state || 'West Bengal',
      pincode: address.pincode || address.postalCode || '712304',
      postalCode: address.postalCode || address.pincode || '712304',
      country: address.country || 'India',
      countryCode: address.countryCode || 'IN',
      isDefault: Boolean(address.isDefault),
      type: address.type || 'home',
      createdAt: address.createdAt || now,
      updatedAt: now
    };

    if (address.email) rawAddress.email = address.email;
    if (address.house) rawAddress.house = address.house;
    if (address.building) rawAddress.building = address.building;
    if (address.street) rawAddress.street = address.street;
    if (address.road) rawAddress.road = address.road;
    if (address.area) rawAddress.area = address.area;
    if (address.locality) rawAddress.locality = address.locality;
    if (address.village) rawAddress.village = address.village;
    if (address.suburb) rawAddress.suburb = address.suburb;
    if (address.district) rawAddress.district = address.district;
    if (address.landmark) rawAddress.landmark = address.landmark;
    if (typeof address.latitude === 'number') rawAddress.latitude = address.latitude;
    if (typeof address.longitude === 'number') rawAddress.longitude = address.longitude;
    if (typeof address.accuracy === 'number') rawAddress.accuracy = address.accuracy;

    const finalAddress = rawAddress as Address;

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

  /**
   * Delete an address by ID
   */
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const addresses = await this.getAddresses(userId);
    const updated = addresses.filter(a => a.id !== addressId);
    await this.saveAddresses(userId, updated);
  },

  /**
   * Postal PIN code lookup API (India Post API + fallback dictionary)
   */
  async lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
    const cleaned = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) return null;

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          return {
            pincode: cleaned,
            city: po.District || po.Block || po.Division || '',
            district: po.District || '',
            state: po.State || '',
            country: 'India'
          };
        }
      }
    } catch (e) {
      console.warn('PIN code online lookup failed:', e);
    }

    // Default region fallback for Hooghly PIN codes
    if (cleaned.startsWith('712')) {
      return {
        pincode: cleaned,
        city: 'Hooghly',
        district: 'Hooghly',
        state: 'West Bengal',
        country: 'India'
      };
    }

    return null;
  }
};

export type AddressServiceType = typeof AddressService;
