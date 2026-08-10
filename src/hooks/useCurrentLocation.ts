import { useState, useCallback } from 'react';
import { LocationService, type GPSPositionResult } from '../services/LocationService';
import { LocationPermissionHandler, type LocationErrorDetails } from '../services/LocationPermissionHandler';
import type { ReverseGeocodedAddress } from '../services/ReverseGeocodingService';

export interface UseCurrentLocationReturn {
  isDetecting: boolean;
  detectedAddress: ReverseGeocodedAddress | null;
  positionResult: GPSPositionResult | null;
  errorDetails: LocationErrorDetails | null;
  accuracy: number | null;
  isAccuracyPoor: boolean;
  isConfirmed: boolean;
  detectLocation: () => Promise<ReverseGeocodedAddress | null>;
  confirmLocation: () => void;
  resetDetection: () => void;
}

export const useCurrentLocation = (): UseCurrentLocationReturn => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<ReverseGeocodedAddress | null>(null);
  const [positionResult, setPositionResult] = useState<GPSPositionResult | null>(null);
  const [errorDetails, setErrorDetails] = useState<LocationErrorDetails | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const detectLocation = useCallback(async (): Promise<ReverseGeocodedAddress | null> => {
    setIsDetecting(true);
    setErrorDetails(null);
    setIsConfirmed(false);

    try {
      const result = await LocationService.detectCurrentLocation();
      setPositionResult(result.position);
      setDetectedAddress(result.address);
      return result.address;
    } catch (err) {
      const details = LocationPermissionHandler.handleError(err);
      setErrorDetails(details);
      setDetectedAddress(null);
      setPositionResult(null);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const confirmLocation = useCallback(() => {
    setIsConfirmed(true);
  }, []);

  const resetDetection = useCallback(() => {
    setIsDetecting(false);
    setDetectedAddress(null);
    setPositionResult(null);
    setErrorDetails(null);
    setIsConfirmed(false);
  }, []);

  return {
    isDetecting,
    detectedAddress,
    positionResult,
    errorDetails,
    accuracy: positionResult?.accuracy || null,
    isAccuracyPoor: positionResult?.isAccuracyPoor || false,
    isConfirmed,
    detectLocation,
    confirmLocation,
    resetDetection
  };
};
