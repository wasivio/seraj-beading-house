import { useState, useEffect, useCallback } from 'react';
import { AddressService, type PincodeLookupResult } from '../services/AddressService';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../types';

export interface UseAddressReturn {
  addresses: Address[];
  selectedAddressId: string;
  selectedAddress: Address | null;
  loading: boolean;
  setSelectedAddressId: (id: string) => void;
  loadAddresses: () => Promise<Address[]>;
  saveAddress: (addr: Omit<Address, 'id'> & { id?: string }) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  lookupPincode: (pin: string) => Promise<PincodeLookupResult | null>;
}

export const useAddress = (): UseAddressReturn => {
  const { currentUser, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadAddresses = useCallback(async (): Promise<Address[]> => {
    if (!isAuthenticated || !currentUser?.uid) {
      setAddresses([]);
      setSelectedAddressId('');
      return [];
    }

    setLoading(true);
    try {
      const list = await AddressService.getAddresses(currentUser.uid);
      setAddresses(list);

      // Default selection
      if (list.length > 0) {
        const def = list.find(a => a.isDefault) || list[0];
        setSelectedAddressId(prev => (prev && list.some(a => a.id === prev) ? prev : def.id));
      } else {
        setSelectedAddressId('');
      }
      return list;
    } catch (e) {
      console.error('Error loading addresses:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser?.uid]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const saveAddress = useCallback(async (addr: Omit<Address, 'id'> & { id?: string }): Promise<Address> => {
    if (!currentUser?.uid) throw new Error('Authentication required to save address');
    const saved = await AddressService.saveAddress(currentUser.uid, addr);
    await loadAddresses();
    setSelectedAddressId(saved.id);
    return saved;
  }, [currentUser?.uid, loadAddresses]);

  const deleteAddress = useCallback(async (id: string): Promise<void> => {
    if (!currentUser?.uid) return;
    await AddressService.deleteAddress(currentUser.uid, id);
    await loadAddresses();
  }, [currentUser?.uid, loadAddresses]);

  const lookupPincode = useCallback(async (pin: string): Promise<PincodeLookupResult | null> => {
    return AddressService.lookupPincode(pin);
  }, []);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;

  return {
    addresses,
    selectedAddressId,
    selectedAddress,
    loading,
    setSelectedAddressId,
    loadAddresses,
    saveAddress,
    deleteAddress,
    lookupPincode
  };
};
