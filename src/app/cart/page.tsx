// src/app/cart/page.tsx
import React, { Suspense } from 'react';
import CartPageClient from './CartPageClient';

export const metadata = {
  title: 'Your Cart | Cushion Guru',
  description: 'View your cart items and checkout.',
};

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <CartPageClient />
    </Suspense>
  );
}
