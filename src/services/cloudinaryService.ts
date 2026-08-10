/**
 * Image URL normalization and optimization service.
 * Automatically resolves ImgBB, Google Drive, and Cloudinary URLs into direct direct renderable images,
 * and prevents opening external viewer pages when clicking product images.
 */

export const FALLBACK_PRODUCT_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23b45309" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

/**
 * Normalizes any external image host URL into a direct raw image URL
 */
export const normalizeImageUrl = (rawUrl: string | undefined): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return FALLBACK_PRODUCT_IMAGE;
  const url = rawUrl.trim();
  if (!url) return FALLBACK_PRODUCT_IMAGE;

  // 1. Convert ImgBB viewer page link (e.g. ibb.co/xyz or imgbb.com/xyz) to direct image format
  if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
    // If it's ibb.co/xxxx, convert to direct i.ibb.co or direct URL
    const cleanPath = url.replace(/https?:\/\/(www\.)?(ibb\.co\.com|ibb\.co|imgbb\.com)\//, '');
    if (cleanPath) {
      // Return direct image subdomain
      return `https://i.ibb.co/${cleanPath}`;
    }
  }

  // 2. Convert Google Drive share link to direct embed URL
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  // 3. Convert Dropbox share link to direct download raw image
  if (url.includes('dropbox.com/') && url.includes('dl=0')) {
    return url.replace('dl=0', 'raw=1');
  }

  return url;
};

export const getCloudinaryUrl = (rawUrl: string | undefined, transform = ''): string => {
  const url = normalizeImageUrl(rawUrl);
  if (!url || url === FALLBACK_PRODUCT_IMAGE) return FALLBACK_PRODUCT_IMAGE;

  // If it's a Cloudinary URL, inject transformations
  if (url.includes('cloudinary.com/')) {
    try {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        const transString = transform ? `${transform}/` : 'q_auto,f_auto/';
        return `${parts[0]}/upload/${transString}${parts[1]}`;
      }
    } catch (e) {
      console.error('Error parsing Cloudinary URL', e);
    }
  }

  return url;
};

export const getThumbnailUrl = (url: string | undefined): string => {
  return getCloudinaryUrl(url, 'w_200,h_200,c_fill,g_auto,q_auto,f_auto');
};

export const getDetailsUrl = (url: string | undefined): string => {
  return getCloudinaryUrl(url, 'w_800,c_limit,q_auto,f_auto');
};

export const getCardUrl = (url: string | undefined): string => {
  return getCloudinaryUrl(url, 'w_500,h_500,c_fill,g_auto,q_auto,f_auto');
};
