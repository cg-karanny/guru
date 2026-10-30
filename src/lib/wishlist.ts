import type { CartItem } from '@/context/CartContext';

export interface WishlistItem extends CartItem {
  href?: string;
}

// Custom cart IDs are temporary. Identify a design by its actual selections.
export function wishlistKey(item: WishlistItem): string {
  return JSON.stringify(item.category === 'Custom'
    ? ['Custom', item.name, Object.entries(item.customOptions ?? {}).sort(([a], [b]) => a.localeCompare(b))]
    : [item.category, item.id]);
}

export function isWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as WishlistItem;
  return typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 200
    && typeof item.name === 'string' && item.name.length > 0 && item.name.length <= 500
    && typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0
    && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 999
    && ['Custom', 'Non-Customizable', 'Linked'].includes(item.category ?? '')
    && (item.image === undefined || typeof item.image === 'string')
    && (item.href === undefined || (typeof item.href === 'string' && item.href.startsWith('/') && !item.href.startsWith('//')))
    && (item.stock === undefined || (Number.isInteger(item.stock) && item.stock >= 0))
    && (item.customOptions === undefined || (item.customOptions !== null && typeof item.customOptions === 'object'
      && !Array.isArray(item.customOptions) && Object.values(item.customOptions).every(v => typeof v === 'string')))
    && JSON.stringify(item).length <= 16000;
}
