import { LocationPermissionHandler } from './LocationPermissionHandler';
import { ReverseGeocodingService, type ReverseGeocodedAddress } from './ReverseGeocodingService';

export interface GPSPositionResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isAccuracyPoor: boolean;
}

export const LocationService = {
  // Accuracy threshold in meters (if > 150m, considered low/poor accuracy)
  POOR_ACCURACY_THRESHOLD_METERS: 150,

  /**
   * Check if browser supports Geolocation API
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  },

  /**
   * Request browser location via navigator.geolocation.getCurrentPosition
   * Only called on explicit user interaction.
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GPSPositionResult> {
    if (!this.isSupported()) {
      throw new Error('BROWSER_UNSUPPORTED: Geolocation is not supported by your browser.');
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const timestamp = position.timestamp || Date.now();
          const isAccuracyPoor = accuracy > this.POOR_ACCURACY_THRESHOLD_METERS;

          resolve({
            latitude,
            longitude,
            accuracy,
            timestamp,
            isAccuracyPoor
          });
        },
        (error) => {
          // If high accuracy timed out, retry with standard accuracy before failing
          if (error.code === error.TIMEOUT && defaultOptions.enableHighAccuracy) {
            navigator.geolocation.getCurrentPosition(
              (pos2) => {
                const { latitude, longitude, accuracy } = pos2.coords;
                resolve({
                  latitude,
                  longitude,
                  accuracy,
                  timestamp: pos2.timestamp || Date.now(),
                  isAccuracyPoor: accuracy > this.POOR_ACCURACY_THRESHOLD_METERS
                });
              },
              (err2) => {
                reject(err2);
              },
              { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
            );
          } else {
            reject(error);
          }
        },
        defaultOptions
      );
    });
  },

  /**
   * Full one-step customer location detection and reverse geocoding
   */
  async detectCurrentLocation(): Promise<{
    position: GPSPositionResult;
    address: ReverseGeocodedAddress;
  }> {
    try {
      const position = await this.getCurrentPosition();
      const address = await ReverseGeocodingService.reverseGeocode(
        position.latitude,
        position.longitude,
        position.accuracy
      );

      return { position, address };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Get user-friendly error details
   */
  getErrorMessage(error: unknown) {
    return LocationPermissionHandler.handleError(error);
  }
};
