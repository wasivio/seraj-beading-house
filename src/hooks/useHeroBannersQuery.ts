import { useQuery } from '@tanstack/react-query';
import { firebaseService } from '../services/firebaseService';

export const useHeroBannersQuery = () => {
  return useQuery({
    queryKey: ['heroBanners'],
    queryFn: () => firebaseService.firestore.getHeroBanners(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 60 * 24, // 24 hours persist
    retry: 2,
    refetchOnWindowFocus: false
  });
};
