/**
 * Cloudinary Image URL optimization service.
 * Automatically injects Cloudinary transformations (scaling, compression, auto-format)
 * to optimize image delivery, or returns a standard fallback image if the URL is invalid.
 */

const FALLBACK_PRODUCT_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23cccccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

export const getCloudinaryUrl = (url: string | undefined, transform = ''): string => {
  if (!url) return FALLBACK_PRODUCT_IMAGE;

  // If it's not a Cloudinary URL, return as is (e.g. base64 or other URLs)
  if (!url.includes('cloudinary.com/')) {
    return url;
  }

  try {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Inject transformation rule
      const transString = transform ? `${transform}/` : 'q_auto,f_auto/';
      return `${parts[0]}/upload/${transString}${parts[1]}`;
    }
  } catch (e) {
    console.error('Error parsing Cloudinary URL', e);
  }

  return url;
};

export const getThumbnailUrl = (url: string | undefined): string => {
  return getCloudinaryUrl(url, 'w_150,h_150,c_fill,g_auto,q_auto,f_auto');
};

export const getDetailsUrl = (url: string | undefined): string => {
  return getCloudinaryUrl(url, 'w_800,c_limit,q_auto,f_auto');
};

export const getCardUrl = (url: string | undefined): string => {
  return getCloudinaryUrl(url, 'w_400,h_400,c_fill,g_auto,q_auto,f_auto');
};
