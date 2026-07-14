'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderedCustomOptions } from '@/lib/format-options';

// ── Defined OUTSIDE the main component so React doesn't remount on every render ──
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)', fontSize: '0.95rem',
  background: 'white', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  marginBottom: '0.35rem', display: 'block',
};

const COUNTRY_CODES = [
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+81', label: 'JP (+81)' },
  { code: '+49', label: 'DE (+49)' },
  { code: '+33', label: 'FR (+33)' },
  { code: '+39', label: 'IT (+39)' },
  { code: '+34', label: 'ES (+34)' },
  { code: '+55', label: 'BR (+55)' },
  { code: '+52', label: 'MX (+52)' },
  { code: '+82', label: 'KR (+82)' },
  { code: '+86', label: 'CN (+86)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+966', label: 'SA (+966)' },
  { code: '+27', label: 'ZA (+27)' },
  { code: '+7', label: 'RU (+7)' },
  { code: '+351', label: 'PT (+351)' },
  { code: '+31', label: 'NL (+31)' },
  { code: '+64', label: 'NZ (+64)' },
  { code: '+20', label: 'EG (+20)' },
  { code: '+234', label: 'NG (+234)' },
  { code: '+254', label: 'KE (+254)' },
  { code: '+60', label: 'MY (+60)' },
  { code: '+62', label: 'ID (+62)' },
  { code: '+63', label: 'PH (+63)' },
  { code: '+66', label: 'TH (+66)' },
  { code: '+90', label: 'TR (+90)' },
  { code: '+46', label: 'SE (+46)' },
  { code: '+47', label: 'NO (+47)' },
  { code: '+45', label: 'DK (+45)' },
  { code: '+358', label: 'FI (+358)' },
  { code: '+48', label: 'PL (+48)' },
  { code: '+420', label: 'CZ (+420)' },
  { code: '+36', label: 'HU (+36)' },
  { code: '+40', label: 'RO (+40)' },
  { code: '+380', label: 'UA (+380)' },
  { code: '+30', label: 'GR (+30)' },
  { code: '+972', label: 'IL (+972)' },
  { code: '+92', label: 'PK (+92)' },
  { code: '+880', label: 'BD (+880)' },
  { code: '+94', label: 'LK (+94)' },
  { code: '+977', label: 'NP (+977)' },
  { code: '+95', label: 'MM (+95)' },
  { code: '+84', label: 'VN (+84)' },
  { code: '+57', label: 'CO (+57)' },
  { code: '+54', label: 'AR (+54)' },
  { code: '+56', label: 'CL (+56)' },
  { code: '+51', label: 'PE (+51)' },
  { code: '+58', label: 'VE (+58)' },
  { code: '+593', label: 'EC (+593)' },
];

const FIELDS = [
  { name: 'fullName', label: 'Full name', col: '1 / -1', type: 'text', pattern: "^[a-zA-Z\\s\\-']{2,}$", title: "Only letters and spaces allowed" },
  { name: 'email', label: 'Email address', col: '1 / -1', type: 'email' },
  { name: 'phone', label: 'Phone number', col: '', type: 'tel', isPhone: true },
  { name: 'address', label: 'Street address', col: '1 / -1', type: 'text' },
  { name: 'city', label: 'City', col: '', type: 'text', pattern: "^[a-zA-Z\\s\\-']{2,}$", title: "City name should contain only letters" },
  { name: 'state', label: 'State / Province', col: '', type: 'text', pattern: "^[a-zA-Z\\s\\-']{2,}$", title: "State name should contain only letters" },
  { name: 'zip', label: 'ZIP / Postal code', col: '', type: 'text', pattern: "^(?=.*[0-9])[a-zA-Z0-9\\s\\-]{3,10}$", title: "Valid ZIP/Postal code required (must contain numbers)" },
  { name: 'country', label: 'Country', col: '', type: 'text', pattern: "^[a-zA-Z\\s\\-']{2,}$", title: "Country name should contain only letters" },
];

interface AddrType { fullName: string; email: string; phone: string; phoneCode: string; address: string; city: string; state: string; zip: string; country: string; }

function AddressForm({ values, onChange, onCodeChange }: { values: AddrType; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onCodeChange?: (code: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
      {FIELDS.map(field => (
        <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gridColumn: field.col || '' }}>
          <label style={labelStyle}>{field.label.charAt(0).toUpperCase() + field.label.slice(1)}</label>
          {field.isPhone ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={values.phoneCode || '+1'}
                onChange={e => onCodeChange && onCodeChange(e.target.value)}
                style={{ ...inputStyle, width: '130px', flexShrink: 0 }}
              >
                {COUNTRY_CODES.map(cc => (
                  <option key={cc.code} value={cc.code}>{cc.label}</option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={onChange}
                style={{ ...inputStyle, flex: 1 }}
                required
                placeholder="Phone number"
                pattern="^[0-9\-\s\(\)]{5,15}$"
                title="Valid phone number required"
              />
            </div>
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              value={(values as any)[field.name]}
              onChange={onChange}
              style={inputStyle}
              required
              placeholder={field.label.charAt(0).toUpperCase() + field.label.slice(1)}
              pattern={(field as any).pattern}
              title={(field as any).title}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const EMPTY: AddrType = { fullName: '', email: '', phone: '', phoneCode: '+1', address: '', city: '', state: '', zip: '', country: '' };

const statusColor: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fff7ed', color: '#f59e0b' },
  PROCESSING: { bg: '#eff6ff', color: '#3b82f6' },
  SHIPPED: { bg: '#f5f3ff', color: '#8b5cf6' },
  DELIVERED: { bg: '#f0fdf4', color: '#10b981' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
};

export default function CartPageClient() {
  const { items, total, count, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDetectingBilling, setIsDetectingBilling] = useState(false);
  const [shipping, setShipping] = useState<AddrType>({ ...EMPTY });
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<AddrType>({ ...EMPTY });
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'COD'>('STRIPE');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const deliveryCharge = 0;
  const finalTotal = total + deliveryCharge;

  // Open checkout automatically when ?checkout=1 is in the URL
  useEffect(() => {
    if (searchParams.get('checkout') === '1' && user && count > 0) {
      setShowCheckout(true);
      window.scrollTo({ top: 0 });
    }
  }, [searchParams, user, count]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (e.target.name !== 'email' && typeof val === 'string' && val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }
    setShipping(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleDetectAddress = () => {
    if ("geolocation" in navigator) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            let detectedPhoneCode = shipping.phoneCode || '+1';
            if (data.address.country_code) {
              const detectedIso = data.address.country_code.toLowerCase();
              const isoToCode: Record<string, string> = { us: '+1', ca: '+1', gb: '+44', au: '+61', in: '+91', jp: '+81', de: '+49', fr: '+33', it: '+39', es: '+34', br: '+55', mx: '+52', kr: '+82', cn: '+86', sg: '+65', ae: '+971', sa: '+966', za: '+27', ru: '+7', pt: '+351', nl: '+31', nz: '+64', eg: '+20', ng: '+234', ke: '+254', my: '+60', id: '+62', ph: '+63', th: '+66', tr: '+90', se: '+46', no: '+47', dk: '+45', fi: '+358', pl: '+48', cz: '+420', hu: '+36', ro: '+40', ua: '+380', gr: '+30', il: '+972', pk: '+92', bd: '+880', lk: '+94', np: '+977', mm: '+95', vn: '+84', co: '+57', ar: '+54', cl: '+56', pe: '+51', ve: '+58', ec: '+593' };
              detectedPhoneCode = isoToCode[detectedIso] || detectedPhoneCode;
            }
            setShipping(prev => ({
              ...prev,
              phoneCode: detectedPhoneCode,
              address: data.address.road || data.address.suburb || data.address.neighbourhood || prev.address,
              city: data.address.city || data.address.town || data.address.village || prev.city,
              state: data.address.state || prev.state,
              zip: data.address.postcode || prev.zip,
              country: data.address.country || prev.country
            }));
          } else {
            alert("Could not detect address automatically.");
          }
        } catch (error) {
          alert("Failed to detect address from location.");
        } finally {
          setIsDetecting(false);
        }
      }, (error) => {
        alert("Geolocation error: " + error.message);
        setIsDetecting(false);
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleDetectBillingAddress = () => {
    if ("geolocation" in navigator) {
      setIsDetectingBilling(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            let detectedPhoneCode = billing.phoneCode || '+1';
            if (data.address.country_code) {
              const detectedIso = data.address.country_code.toLowerCase();
              const isoToCode: Record<string, string> = { us: '+1', ca: '+1', gb: '+44', au: '+61', in: '+91', jp: '+81', de: '+49', fr: '+33', it: '+39', es: '+34', br: '+55', mx: '+52', kr: '+82', cn: '+86', sg: '+65', ae: '+971', sa: '+966', za: '+27', ru: '+7', pt: '+351', nl: '+31', nz: '+64', eg: '+20', ng: '+234', ke: '+254', my: '+60', id: '+62', ph: '+63', th: '+66', tr: '+90', se: '+46', no: '+47', dk: '+45', fi: '+358', pl: '+48', cz: '+420', hu: '+36', ro: '+40', ua: '+380', gr: '+30', il: '+972', pk: '+92', bd: '+880', lk: '+94', np: '+977', mm: '+95', vn: '+84', co: '+57', ar: '+54', cl: '+56', pe: '+51', ve: '+58', ec: '+593' };
              detectedPhoneCode = isoToCode[detectedIso] || detectedPhoneCode;
            }
            setBilling(prev => ({
              ...prev,
              phoneCode: detectedPhoneCode,
              address: data.address.road || data.address.suburb || data.address.neighbourhood || prev.address,
              city: data.address.city || data.address.town || data.address.village || prev.city,
              state: data.address.state || prev.state,
              zip: data.address.postcode || prev.zip,
              country: data.address.country || prev.country
            }));
          } else {
            alert("Could not detect address automatically.");
          }
        } catch (error) {
          alert("Failed to detect address from location.");
        } finally {
          setIsDetectingBilling(false);
        }
      }, (error) => {
        alert("Geolocation error: " + error.message);
        setIsDetectingBilling(false);
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (e.target.name !== 'email' && typeof val === 'string' && val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }
    setBilling(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/account'); return; }
    setIsProcessing(true);
    try {
      // 1. Create the Order in DB
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          total: finalTotal,
          deliveryCharge,
          paymentMethod,
          status: 'ORDER_RECEIVED',
          shippingAddr: { ...shipping, phone: `${shipping.phoneCode || '+1'}${shipping.phone}` },
          billingAddr: billingSame ? { ...shipping, phone: `${shipping.phoneCode || '+1'}${shipping.phone}` } : { ...billing, phone: `${billing.phoneCode || '+1'}${billing.phone}` },
          notes: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Stripe checkout initiated',
        }),
      });
      if (res.ok) {
        const order = await res.json();

        if (paymentMethod === 'STRIPE') {
          // 2. Init Stripe Checkout
          const stripeRes = await fetch('/api/checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ orderId: order.id }),
          });
          const session = await stripeRes.json();
          if (session.url) {
            window.location.href = session.url;
          } else {
            alert('Stripe error: ' + (session.error || 'Unknown'));
            setIsProcessing(false);
          }
        } else {
          // COD - finish
          clearCart();
          router.push('/account/orders');
        }
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || err.error}`);
        setIsProcessing(false);
      }
    } catch {
      alert('Error placing order');
      setIsProcessing(false);
    }
  };

  if (count === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 'max(120px, 15vh)', background: 'var(--off-white)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          {/* 🛒 */}
          <svg xmlns="http://www.w3.org/2000/svg" height={100} width={100} viewBox="0 0 512 512"><g strokeWidth="0"><path d="M14.5 1.5c-2.2.8-5.9 3.4-8.2 5.8C-4 18.2-1.5 33.9 11.8 42.2c3.5 2.2 4.9 2.3 26.7 2.8l23 .5 6.5 3.1c7.5 3.6 14.2 9.8 17.6 16.5C87.5 69 146 294 146 297.7c0 .5-11.3 7.4-25.1 15.3-20.1 11.4-26.3 15.4-30.8 20-10.3 10.4-15.8 25.2-14.8 39.5 1.6 21.9 14.3 38.7 35.5 46.8l5.7 2.2 172.5.3c134.6.2 173.5 0 177-1 8.5-2.3 16-12.4 16-21.4 0-8.7-7.6-19.1-15.5-21.3-2.8-.8-53.7-1.1-172.8-1.1H124.9l-2.4-2.5c-2.9-2.8-3.2-6.4-.8-9.4 1-1.1 14.2-9 29.3-17.6l27.5-15.5h63.6c61.1 0 64-.1 70.2-2 7-2.2 14.9-7.7 18.8-13.1 1.2-1.7 3.3-5.7 4.5-8.8l2.3-5.6 44.3-.5c37.8-.5 45-.8 49.3-2.3 12.9-4.3 25.5-15.2 31.2-26.9 2.1-4.5 9.8-32.6 26.2-96.9 12.7-49.8 23.1-91.3 23.1-92.3 0-.9-1.1-2.8-2.5-4.1l-2.4-2.5H136.2l-1.2-5.3c-.7-2.8-2.5-9.3-4.1-14.2C121.5 28 95.7 5.9 65 1 54.9-.5 19.4-.2 14.5 1.5m51.2 15C73.6 18 87.4 23.9 92 27.8l2.5 2.1-5.1 5.2-5.2 5.1-4.4-2.6c-10.3-6-14.5-6.9-38.6-7.5-22-.6-22.4-.6-24.3-3-2.6-3.2-2.4-6.7.6-9.6C19.9 15 20.1 15 38.9 15c12.6 0 21.5.5 26.8 1.5m42.2 27.4c6.6 9.3 8.7 16.6 39.1 135.6 26.7 104.7 30.4 118.3 32.6 120.2l2.5 2.3h70c38.4 0 69.9.3 69.9.8 0 2.2-5.6 8.5-9.8 10.9l-4.7 2.8-67 .5-67 .5-28.4 16C125.9 344.3 115.2 351 112 354c-6.5 6.4-8.4 13.5-5.9 22.5 1.4 5.1 9.3 13 14.6 14.4 2.6.8 56.6 1.1 172.6 1.1h168.8l2.4 2.5c3.2 3.1 3.2 6.9 0 10.1l-2.4 2.4-171.8-.2-171.8-.3-6.1-2.8c-7.7-3.6-15.4-11.3-19.1-19.2-2.4-5.1-2.8-7.3-2.8-15 0-7.8.4-9.8 2.8-15.1 4.3-9.2 10.7-14.7 29.7-25.5 39.2-22 37.8-21.2 39-24.5.7-1.6-6.9-32.6-28.1-115.6C101.3 61 101.9 63.4 97.8 56.1l-3-5.4 4.8-4.8c2.7-2.7 5.1-4.9 5.5-4.9s1.7 1.3 2.8 2.9m91.5 50.8c1.1 5.2 7.6 48.6 7.6 50.4s-1.3 1.9-26.4 1.9h-26.4l-1.1-4.3c-.6-2.3-3.6-13.9-6.6-25.8-3-11.8-5.7-22.3-6.1-23.2-.6-1.6 1.7-1.7 28.9-1.7h29.5zm74 4c.3 3.8.8 12.2 1.1 18.8s.8 15.9 1.1 20.7l.6 8.8h-16c-14.6 0-16.1.2-18.6 2.1-1.9 1.5-2.6 3-2.6 5.4s.7 3.9 2.6 5.4c2.5 1.9 4 2.1 19 2.1H277l.1 5.7c0 3.2.6 15.6 1.2 27.6l1.2 21.7h-46.1l-7.8-51.3c-4.3-28.1-8.6-56.3-9.6-62.5L214.3 92h58.5zm73.6-5c0 5-2.1 45.4-2.6 49l-.5 4.3h-52.7l-.6-8.3c-.3-4.5-.8-14.1-1.1-21.2-.3-7.2-.8-15.8-1.1-19.3l-.6-6.2h29.6c27.5 0 29.6.1 29.6 1.7m73.7.5c-.3 1.3-2.2 13.7-4.3 27.5l-3.8 25.3h-53.4l.4-5.8c.6-8.3 2.4-43.3 2.4-46.5V92h59.2zm67.2 24.8c-3.8 14.9-6.9 27.3-6.9 27.5 0 .3-11.9.5-26.5.5-14.7 0-26.5-.4-26.5-.9s1.8-12.4 4-26.6 4-26.1 4-26.6 13-.9 29.4-.9h29.4zM210 162.5c0 .3 1.8 12.2 4 26.5s4 26.4 4 27-7.8 1-23 1h-22.9l-1-3.8c-.5-2-3.5-13.6-6.6-25.7s-5.8-22.8-6.1-23.8c-.5-1.6 1.2-1.7 25.5-1.7 14.4 0 26.1.2 26.1.5m132.3 21.2c-.6 12-1.2 24.4-1.2 27.6l-.1 5.7-23.2-.2-23.3-.3-1.2-21.5c-.6-11.8-1.1-24.1-1.2-27.3l-.1-5.7h51.5zM410 163c0 .6-1.8 12.7-4 27s-4 26.2-4 26.5-10.3.5-23 .5h-23v-2.3c0-5.1 2.2-50.3 2.6-51.5.4-1.6 51.4-1.8 51.4-.2m66.6.7c-.3 1-3.1 11.7-6.1 23.8-3.1 12.1-6.1 23.7-6.6 25.7l-1 3.8h-46.1l.5-2.3c.3-1.2 2.2-13.6 4.3-27.5l3.8-25.2h25.9c24.1 0 25.8.1 25.3 1.7m-252.2 93.5c2.1 13.9 4 26.3 4.3 27.5l.5 2.3h-19.5c-17.8 0-19.6-.2-20.1-1.8-.3-.9-3.3-12.5-6.6-25.7-3.4-13.2-6.4-24.8-6.6-25.8-.5-1.6 1-1.7 21.9-1.7h22.3zm56-21c.5 3.7 2.6 44.1 2.6 49 0 1.7-1.6 1.8-19.5 1.8-10.7 0-19.5-.4-19.5-.9s-1.8-12.4-4-26.6-4-26.1-4-26.6 9.9-.9 21.9-.9h22zm59.2 4.5c-.3 4.9-.8 14.2-1.1 20.8s-.8 15-1.1 18.7l-.6 6.8H298v-2.7c0-3.2-1.8-38.2-2.4-46.6l-.4-5.7h45zm59.4-6.8c0 1.8-6.5 45.2-7.6 50.3l-.6 2.8H352l.5-7.8c.6-8.1 2.5-43.6 2.5-45.9 0-1 4.4-1.3 22-1.3 20.8 0 22 .1 22 1.9m59.6-.2c-.3 1-1.9 7.4-3.6 14.3s-4 14.5-5.1 16.9c-6.1 13.9-20.6 22.6-36.6 21.9l-6.9-.3 4.2-27c2.3-14.9 4.2-27.1 4.3-27.3.1-.1 10-.2 22.2-.2 20.5 0 22 .1 21.5 1.7M163.7 438c-10.5 2.7-20.6 11.2-25.4 21.5-2.4 5.2-2.8 7.2-2.8 15 0 7.7.4 9.9 2.8 15.1 3.6 7.7 11.3 15.4 19.2 19.1 5.2 2.4 7.3 2.8 15 2.8 8 0 9.7-.3 15.5-3.1 8.2-3.9 14.4-10.1 18.4-18.4 2.8-5.8 3.1-7.5 3.1-15.5s-.3-9.7-3.1-15.5c-6.2-12.9-17.8-20.8-31.6-21.5-4-.3-9 0-11.1.5m20.7 17.7c12.4 8.7 14 24 3.7 34.3-9.4 9.3-21.6 9.4-31.1.2-6.6-6.4-8.4-13.5-5.9-22.6 1.4-5 8.3-12.3 13.4-14.2 6.1-2.2 14.8-1.2 19.9 2.3" /><path d="M167.5 469.5c-1.4 1.3-2.5 3.6-2.5 5 0 3.3 4.2 7.5 7.5 7.5s7.5-4.2 7.5-7.5-4.2-7.5-7.5-7.5c-1.4 0-3.7 1.1-5 2.5M420.7 438c-10.5 2.7-20.6 11.2-25.4 21.5-2.4 5.2-2.8 7.2-2.8 15 0 7.7.4 9.9 2.8 15.1 3.6 7.7 11.3 15.4 19.2 19.1 5.2 2.4 7.3 2.8 15 2.8 8 0 9.7-.3 15.5-3.1 8.2-3.9 14.4-10.1 18.4-18.4 2.8-5.8 3.1-7.5 3.1-15.5s-.3-9.7-3.1-15.5c-6.2-12.9-17.8-20.8-31.6-21.5-4-.3-9 0-11.1.5m20.7 17.7c12.4 8.7 14 24 3.7 34.3-9.4 9.3-21.6 9.4-31.1.2-6.6-6.4-8.4-13.5-5.9-22.6 1.4-5 8.3-12.3 13.4-14.2 6.1-2.2 14.8-1.2 19.9 2.3" /><path d="M424.5 469.5c-1.4 1.3-2.5 3.6-2.5 5 0 3.3 4.2 7.5 7.5 7.5s7.5-4.2 7.5-7.5-4.2-7.5-7.5-7.5c-1.4 0-3.7 1.1-5 2.5" /></g></svg>
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--brand-primary)', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Your Cart is Empty</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 2rem 0' }}>Add some products to get started.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/products" className="btn btn-primary btn-lg">Shop Products</Link>
          <Link href="/customize" className="btn btn-outline btn-lg">Custom Cushion</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 'max(120px, 15vh)', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--brand-primary)', fontSize: '2.5rem', margin: '0 0 2.5rem 0' }}>
          {showCheckout ? 'Checkout' : 'Your Cart'}
        </h1>

        {!showCheckout ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'flex-start' }}>
            {/* Items */}
            <div style={{ flex: '1 1 min(100%, 580px)', minWidth: 0 }}>
              <div className="card card-responsive-padding" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {items.map((item, index) => (
                  <div key={item.id} className="cart-item-row" style={{ paddingBottom: index < items.length - 1 ? '2rem' : 0, borderBottom: index < items.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <div className="cart-item-image-wrapper">
                      {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.category === 'Non-Customizable' ? '🛍️' : '🛋️')}
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-title-row">
                        <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>{item.name}</h3>
                        <button onClick={() => removeItem(item.id)} style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Remove</button>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        {item.category === 'Non-Customizable' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Ready-made Product
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f3e8ff', color: '#7c3aed', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Custom Cushion
                          </span>
                        )}
                      </div>
                      {item.customOptions && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--gray-50)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600 }}>Details:</span>
                          {getOrderedCustomOptions(item.customOptions).map(([k, v], i, arr) => (
                            <span key={k} style={{ wordBreak: 'break-word' }}>
                              {k.charAt(0).toUpperCase() + k.slice(1)}: {v}{i < arr.length - 1 ? ' |' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unit price: <strong>${(item.price || 0).toFixed(2)}</strong></div>
                      <div className="cart-item-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Qty:</label>
                          <select value={item.quantity} onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                            style={{ padding: '0.35rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                            {Array.from({ length: item.category === 'Non-Customizable' && item.stock ? Math.min(item.stock, 10) : 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--brand-secondary)', fontSize: '1.2rem' }}>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ flex: '1 1 min(100%, 280px)', maxWidth: '100%', width: '100%', flexBasis: '280px' }}>
              <div className="card card-responsive-padding" style={{ position: 'sticky', top: 'calc(var(--nav-height, 80px) + 2rem)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-100)' }}>Order Summary</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <span>Subtotal ({count} items)</span><span>${total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <span>Delivery Charge</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${deliveryCharge.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontWeight: 800, fontSize: '1.3rem' }}>
                  <span>Total</span><span style={{ color: 'var(--brand-secondary)' }}>${finalTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => { if (!user) { router.push('/account'); return; } setShowCheckout(true); window.scrollTo({ top: 0 }); }}
                  className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Proceed to Checkout →
                </button>
                <Link href="/products" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* CHECKOUT */
          <form onSubmit={handlePlaceOrder}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 min(100%, 560px)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                <div className="card card-responsive-padding">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--brand-primary)' }}>🚚 Shipping Address</h2>
                    <button
                      type="button"
                      onClick={handleDetectAddress}
                      disabled={isDetecting}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      {isDetecting ? 'Detecting...' : '📍 Auto-Detect'}
                    </button>
                  </div>
                  <AddressForm values={shipping} onChange={handleShippingChange} onCodeChange={(code) => setShipping(prev => ({ ...prev, phoneCode: code }))} />
                </div>

                <div className="card card-responsive-padding">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--brand-primary)' }}>💳 Billing Address</h2>
                      {!billingSame && (
                        <button
                          type="button"
                          onClick={handleDetectBillingAddress}
                          disabled={isDetectingBilling}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          {isDetectingBilling ? 'Detecting...' : '📍 Auto-Detect'}
                        </button>
                      )}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={billingSame} onChange={e => setBillingSame(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Same as shipping
                    </label>
                  </div>
                  {billingSame
                    ? <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>✓ Using same address as shipping</div>
                    : <AddressForm values={billing} onChange={handleBillingChange} onCodeChange={(code) => setBilling(prev => ({ ...prev, phoneCode: code }))} />
                  }
                </div>

                <div className="card card-responsive-padding">
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: 'var(--brand-primary)' }}>💲 Payment Method</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${paymentMethod === 'STRIPE' ? 'var(--brand-primary)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'STRIPE' ? '#f0f4f8' : 'white' }}>
                      <input type="radio" name="paymentMethod" value="STRIPE" checked={paymentMethod === 'STRIPE'} onChange={() => setPaymentMethod('STRIPE')} style={{ transform: 'scale(1.2)' }} />
                      <div style={{ fontWeight: 600 }}>Pay with Stripe (Card)</div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${paymentMethod === 'COD' ? 'var(--brand-primary)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'COD' ? '#f0f4f8' : 'white' }}>
                      <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ transform: 'scale(1.2)' }} />
                      <div style={{ fontWeight: 600 }}>Cash on Delivery (COD)</div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order recap */}
              <div style={{ flex: '1 1 min(100%, 280px)', maxWidth: '100%', width: '100%', flexBasis: '280px' }}>
                <div className="card card-responsive-padding" style={{ position: 'sticky', top: 'calc(var(--nav-height, 80px) + 2rem)' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-100)' }}>Order Items</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                          {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.category === 'Non-Customizable' ? '🛍️' : '🛋️')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                          {item.customOptions && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4, display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {getOrderedCustomOptions(item.customOptions).map(([k, v], i, arr) => (
                                <span key={k} style={{ wordBreak: 'break-word' }}>
                                  {k.charAt(0).toUpperCase() + k.slice(1)}: {v as string}{i < arr.length - 1 ? ' |' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--brand-secondary)', whiteSpace: 'nowrap' }}>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}

                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>Subtotal</span><span>${total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>Delivery Charge</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${deliveryCharge.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontWeight: 800, fontSize: '1.25rem', paddingTop: '1rem', borderTop: '2px solid var(--gray-200)' }}>
                    <span>Total</span><span style={{ color: 'var(--brand-secondary)' }}>${finalTotal.toFixed(2)}</span>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }} disabled={isProcessing}>
                    {isProcessing ? 'Processing…' : (paymentMethod === 'STRIPE' ? 'Pay with Stripe' : 'Place Order')}
                  </button>
                  <button type="button" onClick={() => setShowCheckout(false)} style={{ width: '100%', marginTop: '0.75rem', padding: '0.65rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ← Back to Cart
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
