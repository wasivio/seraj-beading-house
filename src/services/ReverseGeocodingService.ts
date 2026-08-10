export interface ReverseGeocodedAddress {
  houseNumber?: string;
  building?: string;
  road?: string;
  street?: string;
  area?: string;
  locality?: string;
  village?: string;
  suburb?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  pincode: string;
  country: string;
  countryCode: string;
  landmark?: string;
  addressLine: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type GeocodingProviderType = 'nominatim' | 'google' | 'mapbox';

export const ReverseGeocodingService = {
  /**
   * Primary reverse geocoding resolver with pluggable provider architecture
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    accuracy?: number,
    preferredProvider?: GeocodingProviderType
  ): Promise<ReverseGeocodedAddress> {
    const provider = preferredProvider || (import.meta.env.VITE_GEOCODING_PROVIDER as GeocodingProviderType) || 'nominatim';

    // 1. Google Maps Geocoding Provider
    if (provider === 'google' && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      try {
        const res = await this.reverseGeocodeGoogle(latitude, longitude, accuracy);
        if (res) return res;
      } catch (err) {
        console.warn('Google reverse geocode failed, falling back to Nominatim:', err);
      }
    }

    // 2. Mapbox Geocoding Provider
    if (provider === 'mapbox' && import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
      try {
        const res = await this.reverseGeocodeMapbox(latitude, longitude, accuracy);
        if (res) return res;
      } catch (err) {
        console.warn('Mapbox reverse geocode failed, falling back to Nominatim:', err);
      }
    }

    // 3. OpenStreetMap Nominatim Provider (Default High-Precision)
    try {
      const res = await this.reverseGeocodeNominatim(latitude, longitude, accuracy);
      if (res) return res;
    } catch (err) {
      console.warn('Nominatim reverse geocode failed, falling back to BigDataCloud:', err);
    }

    // 4. BigDataCloud Free Fallback
    try {
      const res = await this.reverseGeocodeBigDataCloud(latitude, longitude, accuracy);
      if (res) return res;
    } catch (err) {
      console.warn('BigDataCloud reverse geocode failed:', err);
    }

    // 5. Minimal Fallback Structured Address
    return {
      latitude,
      longitude,
      accuracy,
      addressLine: `GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
      city: 'Hooghly',
      state: 'West Bengal',
      postalCode: '712304',
      pincode: '712304',
      country: 'India',
      countryCode: 'IN',
      formattedAddress: `Janai Subeder More, Hooghly, West Bengal - 712304`
    };
  },

  /**
   * OpenStreetMap Nominatim Geocoding Resolver
   */
  async reverseGeocodeNominatim(
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<ReverseGeocodedAddress | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'SirajBeddingHouse/1.0'
      }
    });

    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address || {};

    const houseNumber = addr.house_number || addr.housenumber || '';
    const building = addr.building || addr.amenity || '';
    const road = addr.road || addr.street || addr.footway || addr.path || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || '';
    const village = addr.village || addr.hamlet || addr.isolated_dwelling || '';
    const locality = addr.locality || addr.subdistrict || suburb || village || '';
    const area = [suburb, locality, village].filter(Boolean).join(', ') || '';
    const city = addr.city || addr.town || addr.municipality || village || addr.county || 'Hooghly';
    const district = addr.state_district || addr.county || addr.district || 'Hooghly';
    const state = addr.state || 'West Bengal';
    const postalCode = addr.postcode || '712304';
    const country = addr.country || 'India';
    const countryCode = (addr.country_code || 'in').toUpperCase();

    // Construct clean address line
    const streetElements = [building, houseNumber ? `House No. ${houseNumber}` : '', road].filter(Boolean);
    const addressLine = streetElements.length > 0
      ? streetElements.join(', ')
      : (area ? `${area}` : (data.name || data.display_name?.split(',')[0] || ''));

    const formattedAddress = data.display_name || `${addressLine}, ${city}, ${state} - ${postalCode}`;

    return {
      houseNumber,
      building,
      road,
      street: road,
      area,
      locality,
      village,
      suburb,
      city,
      district,
      state,
      postalCode,
      pincode: postalCode,
      country,
      countryCode,
      addressLine: addressLine || 'Near Location',
      formattedAddress,
      latitude,
      longitude,
      accuracy
    };
  },

  /**
   * Google Maps Reverse Geocoding Resolver
   */
  async reverseGeocodeGoogle(
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<ReverseGeocodedAddress | null> {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) return null;

    const first = data.results[0];
    const components = first.address_components || [];

    const getComp = (type: string) => {
      const found = components.find((c: any) => c.types.includes(type));
      return found ? found.long_name : '';
    };

    const houseNumber = getComp('street_number');
    const road = getComp('route');
    const sublocality = getComp('sublocality') || getComp('sublocality_level_1');
    const locality = getComp('locality');
    const district = getComp('administrative_area_level_2');
    const state = getComp('administrative_area_level_1') || 'West Bengal';
    const postalCode = getComp('postal_code') || '712304';
    const country = getComp('country') || 'India';
    const countryCode = (components.find((c: any) => c.types.includes('country'))?.short_name || 'IN').toUpperCase();

    const addressLine = [houseNumber ? `No. ${houseNumber}` : '', road, sublocality].filter(Boolean).join(', ') || first.formatted_address.split(',')[0];

    return {
      houseNumber,
      road,
      street: road,
      area: sublocality,
      locality: sublocality || locality,
      city: locality || district || 'Hooghly',
      district: district || 'Hooghly',
      state,
      postalCode,
      pincode: postalCode,
      country,
      countryCode,
      addressLine,
      formattedAddress: first.formatted_address,
      latitude,
      longitude,
      accuracy
    };
  },

  /**
   * Mapbox Reverse Geocoding Resolver
   */
  async reverseGeocodeMapbox(
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<ReverseGeocodedAddress | null> {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) return null;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=address,poi,neighborhood,locality,place,postcode,region,country`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    const primary = data.features[0];
    const context = primary.context || [];

    const getFromContext = (prefix: string) => {
      const item = context.find((c: any) => c.id.startsWith(prefix));
      return item ? item.text : '';
    };

    const place = getFromContext('place') || 'Hooghly';
    const region = getFromContext('region') || 'West Bengal';
    const postcode = getFromContext('postcode') || '712304';
    const country = getFromContext('country') || 'India';
    const locality = getFromContext('locality') || getFromContext('neighborhood') || '';

    return {
      addressLine: primary.text || primary.place_name?.split(',')[0] || 'Near Location',
      area: locality,
      locality,
      city: place,
      district: place,
      state: region,
      postalCode: postcode,
      pincode: postcode,
      country,
      countryCode: 'IN',
      formattedAddress: primary.place_name || `${primary.text}, ${place}, ${region} - ${postcode}`,
      latitude,
      longitude,
      accuracy
    };
  },

  /**
   * BigDataCloud Client-side Free Reverse Geocoding
   */
  async reverseGeocodeBigDataCloud(
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<ReverseGeocodedAddress | null> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const street = data.locality || data.localityInfo?.administrative?.[3]?.name || '';
    const city = data.city || data.localityInfo?.administrative?.[2]?.name || 'Hooghly';
    const state = data.principalSubdivision || 'West Bengal';
    const postalCode = data.postcode || '712304';
    const country = data.countryName || 'India';
    const countryCode = data.countryCode || 'IN';

    const addressLine = street ? `${street}, Near ${city}` : `Near ${city}`;

    return {
      addressLine,
      area: street,
      locality: street,
      city,
      district: city,
      state,
      postalCode,
      pincode: postalCode,
      country,
      countryCode,
      formattedAddress: `${addressLine}, ${city}, ${state} - ${postalCode}`,
      latitude,
      longitude,
      accuracy
    };
  }
};
