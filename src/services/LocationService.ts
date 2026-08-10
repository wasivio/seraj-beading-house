export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
}

export const LocationService = {
  /**
   * Get device GPS coordinates with automatic retry and IP-based fallback
   */
  async getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
    if (!navigator.geolocation) {
      return this.getIPLocation();
    }

    return new Promise((resolve) => {
      // First attempt with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          // Second attempt with low accuracy / longer timeout
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              });
            },
            async () => {
              // Final fallback: IP Geolocation
              try {
                const ipLoc = await LocationService.getIPLocation();
                resolve(ipLoc);
              } catch {
                // Default fallback to store location
                resolve({ latitude: 22.7118, longitude: 88.2435 });
              }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  },

  /**
   * Fallback to IP-based approximate location
   */
  async getIPLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          return { latitude: data.latitude, longitude: data.longitude };
        }
      }
    } catch (e) {
      console.warn('IP location fetch failed:', e);
    }

    // Try secondary IP lookup
    try {
      const res2 = await fetch('https://ipapi.co/json/');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.latitude && data2.longitude) {
          return { latitude: data2.latitude, longitude: data2.longitude };
        }
      }
    } catch (e) {
      console.warn('Secondary IP lookup failed:', e);
    }

    // Default to Janai, Hooghly
    return { latitude: 22.7118, longitude: 88.2435 };
  },

  /**
   * Reverse Geocode Lat/Lng to exact real-world Street, City, State, and Pincode
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<ResolvedLocation> {
    // 1. Try OpenStreetMap Nominatim API
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.residential || '';
        const village = addr.village || addr.hamlet || addr.subdistrict || '';
        const streetParts = [road, village].filter(Boolean);
        const addressLine = streetParts.length > 0 
          ? streetParts.join(', ') 
          : (data.name || data.display_name?.split(',')[0] || 'Near Location');

        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Hooghly';
        const state = addr.state || 'West Bengal';
        const pincode = addr.postcode || '712304';

        const formatted = data.display_name || `${addressLine}, ${city}, ${state} - ${pincode}`;

        return {
          latitude,
          longitude,
          addressLine,
          city,
          state,
          pincode,
          formattedAddress: formatted
        };
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode failed, trying BigDataCloud:', err);
    }

    // 2. Fallback to BigDataCloud Free Client API
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(bdcUrl);
      if (res.ok) {
        const data = await res.json();
        
        const street = data.locality || data.localityInfo?.administrative?.[3]?.name || '';
        const city = data.city || data.localityInfo?.administrative?.[2]?.name || 'Hooghly';
        const state = data.principalSubdivision || 'West Bengal';
        const pincode = data.postcode || '712304';
        const addressLine = street ? `${street}, Near ${city}` : `Near ${city}`;

        return {
          latitude,
          longitude,
          addressLine,
          city,
          state,
          pincode,
          formattedAddress: `${addressLine}, ${city}, ${state} - ${pincode}`
        };
      }
    } catch (err) {
      console.warn('BigDataCloud reverse geocode failed:', err);
    }

    // Default formatted return
    return {
      latitude,
      longitude,
      addressLine: 'Current GPS Location',
      city: 'Hooghly',
      state: 'West Bengal',
      pincode: '712304',
      formattedAddress: `Janai Subeder More, Hooghly, West Bengal - 712304`
    };
  },

  /**
   * One-step full auto-detect location
   */
  async detectCurrentLocation(): Promise<ResolvedLocation> {
    const coords = await this.getCurrentCoordinates();
    return this.reverseGeocode(coords.latitude, coords.longitude);
  }
};
