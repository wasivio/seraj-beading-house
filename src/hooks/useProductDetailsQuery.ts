import { useQuery } from '@tanstack/react-query';
import { firebaseService } from '../services/firebaseService';

export const useProductDetailsQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => {
      if (!id) throw new Error('Product ID required');
      return firebaseService.firestore.getProductById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
    refetchOnWindowFocus: false
  });
};
