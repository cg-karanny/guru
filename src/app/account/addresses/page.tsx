'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type AddressKind = 'DELIVERY' | 'BILLING';

type SavedAddress = {
  id: string;
  kind: AddressKind;
  label: string | null;
  fullName: string;
  email: string;
  phone: string;
  phoneCode: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

type AddressFormState = Omit<SavedAddress, 'id'>;

const emptyAddress: AddressFormState = {
  kind: 'DELIVERY',
  label: '',
  fullName: '',
  email: '',
  phone: '',
  phoneCode: '+1',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  isDefault: false,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.95rem',
  background: 'white',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.35rem',
  display: 'block',
};

function formatAddress(address: SavedAddress) {
  return `${address.address}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
}

export default function AccountAddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [form, setForm] = useState<AddressFormState>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/account');
  }, [user, loading, router]);

  const loadAddresses = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/account/addresses', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setAddresses(data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  useEffect(() => {
    if (user && !editingId) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user, editingId]);

  const updateField = (field: keyof AddressFormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyAddress,
      fullName: user?.name || '',
      email: user?.email || '',
    });
  };

  const editAddress = (address: SavedAddress) => {
    setEditingId(address.id);
    setForm({
      kind: address.kind,
      label: address.label || '',
      fullName: address.fullName,
      email: address.email,
      phone: address.phone,
      phoneCode: address.phoneCode || '+1',
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      isDefault: address.isDefault,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this saved address?')) return;
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setMessage({ type: 'success', text: 'Address deleted.' });
      await loadAddresses();
      if (editingId === id) resetForm();
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Failed to delete address.' });
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch(editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ type: 'success', text: editingId ? 'Address updated.' : 'Address saved.' });
      resetForm();
      await loadAddresses();
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to save address.' });
    }
    setSaving(false);
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 'max(120px, 15vh)', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1050px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--brand-primary)', margin: 0 }}>Saved Addresses</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>Manage delivery and billing addresses for faster checkout.</p>
          </div>
          <Link href="/account/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: '2rem', alignItems: 'start' }}>
          <form onSubmit={saveAddress} className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', marginBottom: '1.5rem' }}>{editingId ? 'Edit Address' : 'Add Address'}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Address Type</label>
                <select value={form.kind} onChange={e => updateField('kind', e.target.value as AddressKind)} style={inputStyle}>
                  <option value="DELIVERY">Delivery</option>
                  <option value="BILLING">Billing</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Label</label>
                <input value={form.label || ''} onChange={e => updateField('label', e.target.value)} style={inputStyle} placeholder="Home, Office, Warehouse" />
              </div>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={form.fullName} onChange={e => updateField('fullName', e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Code</label>
                  <input value={form.phoneCode} onChange={e => updateField('phoneCode', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={e => updateField('phone', e.target.value)} style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Street Address</label>
                <input value={form.address} onChange={e => updateField('address', e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input value={form.city} onChange={e => updateField('city', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input value={form.state} onChange={e => updateField('state', e.target.value)} style={inputStyle} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>ZIP / Postal Code</label>
                  <input value={form.zip} onChange={e => updateField('zip', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input value={form.country} onChange={e => updateField('country', e.target.value)} style={inputStyle} required />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.isDefault} onChange={e => updateField('isDefault', e.target.checked)} style={{ width: 16, height: 16 }} />
                Use as default {form.kind === 'DELIVERY' ? 'delivery' : 'billing'} address
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}</button>
              </div>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {fetching ? (
              <div className="card" style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>No saved addresses yet</h2>
                <p style={{ margin: 0 }}>Add a delivery or billing address to pre-fill checkout next time.</p>
              </div>
            ) : (
              addresses.map(address => (
                <div key={address.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{address.label || address.fullName}</h3>
                        <span style={{ background: address.kind === 'DELIVERY' ? '#eff6ff' : '#fff7ed', color: address.kind === 'DELIVERY' ? '#1d4ed8' : '#c2410c', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {address.kind === 'DELIVERY' ? 'Delivery' : 'Billing'}
                        </span>
                        {address.isDefault && <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>Default</span>}
                      </div>
                      <p style={{ margin: '0.35rem 0 0', color: 'var(--text-primary)', fontWeight: 600 }}>{address.fullName}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => editAddress(address)}>Edit</button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => deleteAddress(address.id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{formatAddress(address)}</p>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{address.email} | {address.phoneCode}{address.phone}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
