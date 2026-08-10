export type LocationErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'BROWSER_UNSUPPORTED'
  | 'POOR_ACCURACY'
  | 'GEOCODING_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface LocationErrorDetails {
  type: LocationErrorType;
  title: string;
  message: string;
  actionHint: string;
  canRetry: boolean;
}

export const LocationPermissionHandler = {
  /**
   * Maps native GeolocationPositionError or custom error to structured user-friendly details
   */
  handleError(error: unknown): LocationErrorDetails {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const geoErr = error as GeolocationPositionError;
      switch (geoErr.code) {
        case geoErr.PERMISSION_DENIED:
          return {
            type: 'PERMISSION_DENIED',
            title: 'Location Permission Denied',
            message: 'You have blocked location access in your browser.',
            actionHint: 'Please allow location permission in your browser settings (click lock icon in address bar) or enter your address manually.',
            canRetry: true
          };
        case geoErr.POSITION_UNAVAILABLE:
          return {
            type: 'POSITION_UNAVAILABLE',
            title: 'Location Unavailable',
            message: 'Your device was unable to determine your current location.',
            actionHint: 'Please ensure your device GPS / location services are turned on and try again.',
            canRetry: true
          };
        case geoErr.TIMEOUT:
          return {
            type: 'TIMEOUT',
            title: 'Location Request Timed Out',
            message: 'It took too long to get a satellite GPS fix.',
            actionHint: 'Please move to an open area and try again, or enter your address manually.',
            canRetry: true
          };
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('BROWSER_UNSUPPORTED')) {
        return {
          type: 'BROWSER_UNSUPPORTED',
          title: 'Browser Not Supported',
          message: 'Your web browser does not support the Geolocation API.',
          actionHint: 'Please upgrade your browser or enter your delivery address manually.',
          canRetry: false
        };
      }
      if (error.message.includes('POOR_ACCURACY')) {
        return {
          type: 'POOR_ACCURACY',
          title: 'Low GPS Accuracy',
          message: 'Your detected location accuracy is low.',
          actionHint: 'Please move to an open area and try again, or manually verify your address details.',
          canRetry: true
        };
      }
      if (error.message.includes('GEOCODING_FAILED') || error.message.includes('Failed to fetch')) {
        return {
          type: 'NETWORK_ERROR',
          title: 'Network / Geocoding Error',
          message: 'Coordinates detected, but could not convert them into a postal address.',
          actionHint: 'Please check your internet connection and try again, or fill in your address manually.',
          canRetry: true
        };
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      title: 'Location Detection Error',
      message: 'An unexpected issue occurred while detecting your location.',
      actionHint: 'You can enter your delivery address manually at any time.',
      canRetry: true
    };
  }
};
