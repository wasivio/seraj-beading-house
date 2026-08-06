import { useQuery } from '@tanstack/react-query';
import { firebaseService } from '../services/firebaseService';

export const useBrandsQuery = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => firebaseService.firestore.getBrands(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persist
    retry: 2,
    refetchOnWindowFocus: false
  });
};
