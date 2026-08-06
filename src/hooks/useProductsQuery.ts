import { useQuery } from '@tanstack/react-query';
import { firebaseService } from '../services/firebaseService';

export const useProductsQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => firebaseService.firestore.getProducts(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 60 * 24, // Cache persist 24 hours
    retry: 2,
    refetchOnWindowFocus: false
  });
};
