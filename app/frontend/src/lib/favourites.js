export const FAVOURITES_KEY = 'pahwa-favourites-v1';
export const favouriteKey = item => item.kind + ':' + item.slug;
export function restoreFavourites(raw) {
  try {
    const value = JSON.parse(raw || '[]');
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.filter(item => {
      if (!item || !['product', 'menu'].includes(item.kind) || typeof item.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || item.slug.length > 160) return false;
      const key = favouriteKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 100).map(({kind, slug}) => ({kind, slug}));
  } catch { return []; }
}
export function toggleFavourite(items, item) {
  const valid = restoreFavourites(JSON.stringify([item]))[0];
  if (!valid) return items;
  const key = favouriteKey(valid);
  return items.some(entry => favouriteKey(entry) === key)
    ? items.filter(entry => favouriteKey(entry) !== key)
    : [...items, valid].slice(-100);
}
