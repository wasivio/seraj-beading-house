/**
 * Category Normalization and Matching Utilities for Siraj Bedding House
 * Ensures products created in Admin panel with any category format (Name, Slug, ID, or Object)
 * always match properly on the customer website.
 */

export interface CategoryInfo {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  image?: string;
  imageUrl?: string;
  icon?: string;
}

/**
 * Strips special characters, hyphens, underscores and extra spaces for fuzzy matching
 * Example: "Double-Bed Sheet" -> "doublebedsheet"
 */
export const toCleanAlphanumeric = (str: string | undefined | null): string => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Normalizes singular/plural word forms
 */
export const normalizePlural = (str: string): string => {
  const clean = toCleanAlphanumeric(str);
  if (clean.endsWith('es') && clean.length > 4) {
    return clean.slice(0, -2); // mattresses -> mattress, boxes -> box
  }
  if (clean.endsWith('s') && !clean.endsWith('ss') && clean.length > 3) {
    return clean.slice(0, -1); // pillows -> pillow, bedsheets -> bedsheet
  }
  return clean;
};

/**
 * Extracts a human-readable display string from any product category field representation
 */
export const extractProductCategoryName = (prod: any): string => {
  if (!prod) return '';
  if (typeof prod.category === 'string' && prod.category.trim()) {
    return prod.category.trim();
  }
  if (typeof prod.categoryName === 'string' && prod.categoryName.trim()) {
    return prod.categoryName.trim();
  }
  if (typeof prod.categoryTitle === 'string' && prod.categoryTitle.trim()) {
    return prod.categoryTitle.trim();
  }
  if (prod.category && typeof prod.category === 'object') {
    return prod.category.name || prod.category.title || prod.category.label || prod.category.slug || prod.category.id || '';
  }
  if (typeof prod.categoryId === 'string' && prod.categoryId.trim()) {
    return prod.categoryId.trim();
  }
  return '';
};

/**
 * Checks if a product matches a target category filter
 */
export const matchesCategory = (
  prod: any,
  targetCategory: string | undefined | null,
  dbCategories: CategoryInfo[] = []
): boolean => {
  if (!targetCategory || targetCategory === 'all' || targetCategory.trim() === '') {
    return true;
  }

  const cleanTarget = toCleanAlphanumeric(targetCategory);
  const pluralTarget = normalizePlural(targetCategory);
  const targetLower = targetCategory.trim().toLowerCase();

  // Find if targetCategory maps to a known DB Category doc
  const targetCatDoc = dbCategories.find(c => {
    const idMatch = c.id && (c.id === targetCategory || c.id === targetLower);
    const slugMatch = c.slug && (toCleanAlphanumeric(c.slug) === cleanTarget || c.slug.toLowerCase() === targetLower);
    const nameMatch = (c.name || c.title) && (toCleanAlphanumeric(c.name || c.title) === cleanTarget || (c.name || c.title || '').toLowerCase() === targetLower);
    return idMatch || slugMatch || nameMatch;
  });

  // Extract all possible identifiers from product
  const prodCategoryStr = extractProductCategoryName(prod);
  const prodCategoryId = String(prod.categoryId || (prod.category && typeof prod.category === 'object' ? prod.category.id : '') || (typeof prod.category === 'string' ? prod.category : '')).trim();
  const prodCategorySlug = String(prod.categorySlug || (prod.category && typeof prod.category === 'object' ? prod.category.slug : '')).trim();

  const prodClean = toCleanAlphanumeric(prodCategoryStr);
  const prodPlural = normalizePlural(prodCategoryStr);

  // 1. Direct Alphanumeric Match ("foam-mattress" vs "Foam Mattress" or "foammattress")
  if (prodClean === cleanTarget || prodPlural === pluralTarget) {
    return true;
  }

  // 2. ID Direct Match
  if (prodCategoryId && (prodCategoryId === targetCategory || prodCategoryId === targetLower)) {
    return true;
  }

  // 3. Slug Direct Match
  if (prodCategorySlug && (toCleanAlphanumeric(prodCategorySlug) === cleanTarget || prodCategorySlug.toLowerCase() === targetLower)) {
    return true;
  }

  // 4. If Target Category doc found in DB Categories, check if product matches that doc's ID, Name or Slug
  if (targetCatDoc) {
    if (targetCatDoc.id && (prodCategoryId === targetCatDoc.id || prodClean === toCleanAlphanumeric(targetCatDoc.id))) {
      return true;
    }
    const docNameClean = toCleanAlphanumeric(targetCatDoc.name || targetCatDoc.title);
    if (docNameClean && (prodClean === docNameClean || prodPlural === normalizePlural(docNameClean))) {
      return true;
    }
    if (targetCatDoc.slug && (prodClean === toCleanAlphanumeric(targetCatDoc.slug) || prodCategorySlug === targetCatDoc.slug)) {
      return true;
    }
  }

  // 5. If product has a Category ID that belongs to a DB Category doc, check if that doc matches target
  const prodCatDoc = dbCategories.find(c => c.id === prodCategoryId || (c.id && c.id === prodCategoryStr));
  if (prodCatDoc) {
    const docNameClean = toCleanAlphanumeric(prodCatDoc.name || prodCatDoc.title);
    const docSlugClean = toCleanAlphanumeric(prodCatDoc.slug);
    if (docNameClean === cleanTarget || normalizePlural(docNameClean) === pluralTarget) {
      return true;
    }
    if (docSlugClean === cleanTarget) {
      return true;
    }
  }

  // 6. Substring / Word Inclusion (e.g. "Mattress" matches "Spring Mattress" or "Foam Mattress")
  if (cleanTarget.length >= 3 && prodClean.length >= 3) {
    if (prodClean.includes(cleanTarget) || cleanTarget.includes(prodClean)) {
      return true;
    }
    if (prodPlural.includes(pluralTarget) || pluralTarget.includes(prodPlural)) {
      return true;
    }
  }

  return false;
};
