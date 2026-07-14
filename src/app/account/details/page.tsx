'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OtpVerification from '@/components/OtpVerification';

// User PATCH API
async function updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) {
  const res = await fetch('/api/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res;
}

export default function AccountDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email update states
  const [enableEmailUpdate, setEnableEmailUpdate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [existingEmailVerified, setExistingEmailVerified] = useState(false);
  const [newEmailVerified, setNewEmailVerified] = useState(false);
  const [verifyingExistingEmail, setVerifyingExistingEmail] = useState(false);
  const [verifyingNewEmail, setVerifyingNewEmail] = useState(false);
  const [existingEmailOtpSent, setExistingEmailOtpSent] = useState(false);
  const [newEmailOtpSent, setNewEmailOtpSent] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/account');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  useEffect(() => {
    // Reset email update state when toggler is unchecked
    if (!enableEmailUpdate) {
      setNewEmail('');
      setExistingEmailVerified(false);
      setNewEmailVerified(false);
      setExistingEmailOtpSent(false);
      setNewEmailOtpSent(false);
    }
  }, [enableEmailUpdate]);

  const handleSendOtpExistingEmail = async () => {
    setEmailMessage(null);
    setVerifyingExistingEmail(true);
    try {
      const res = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, type: 'EXISTING_EMAIL' }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMessage({ type: 'success', text: 'OTP sent to existing email!' });
        setExistingEmailOtpSent(true);
      } else {
        setEmailMessage({ type: 'error', text: data.error || 'Failed to send OTP' });
      }
    } catch {
      setEmailMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setVerifyingExistingEmail(false);
    }
  };

  const handleSendOtpNewEmail = async () => {
    if (!newEmail) {
      setEmailMessage({ type: 'error', text: 'Please enter a new email address' });
      return;
    }
    setEmailMessage(null);
    setVerifyingNewEmail(true);
    try {
      const res = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, type: 'NEW_EMAIL' }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMessage({ type: 'success', text: 'OTP sent to new email!' });
        setNewEmailOtpSent(true);
      } else {
        setEmailMessage({ type: 'error', text: data.error || 'Failed to send OTP' });
      }
    } catch {
      setEmailMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setVerifyingNewEmail(false);
    }
  };

  const handleCompleteEmailUpdate = async () => {
    setSavingEmail(true);
    try {
      const body: any = { email: newEmail };
      const res = await updateProfile(body);
      const data = await res.json();
      if (res.ok) {
        setEmailMessage({ type: 'success', text: 'Email updated successfully! Changes will reflect on next login.' });
        setEnableEmailUpdate(false);
        setNewEmail('');
        setExistingEmailVerified(false);
        setNewEmailVerified(false);
        setExistingEmailOtpSent(false);
        setNewEmailOtpSent(false);
      } else {
        setEmailMessage({ type: 'error', text: data.error || 'Failed to update email.' });
      }
    } catch {
      setEmailMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSaving(true);
    try {
      const body: any = { name, email };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await updateProfile(body);
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully! Changes will reflect on next login.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.9rem',
    border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem', background: 'white', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 'max(120px, 15vh)', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--brand-primary)', margin: 0 }}>Account Details</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>Manage your personal information and password</p>
          </div>
          <Link href="/account/dashboard" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
        </div>

        {message && (
          <div style={{
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#15803d' : '#dc2626',
            fontWeight: 500, fontSize: '0.95rem',
          }}>
            {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile form */}
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Profile info */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Personal Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your full name" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={email} readOnly style={{ ...inputStyle, background: 'var(--gray-50)', cursor: 'not-allowed' }} placeholder="you@example.com" />
                </div>
                <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>Role:</strong> {user.role === 'ADMIN' ? ' Administrator' : ' Customer'}
                  {/* {' · '} */}
                  {/* <strong>Member since:</strong> Account registered */}
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--gray-200)' }}>
                  <input
                    type="checkbox"
                    id="enableEmailUpdate"
                    checked={enableEmailUpdate}
                    onChange={(e) => setEnableEmailUpdate(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label
                    htmlFor="enableEmailUpdate"
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Change Email Address
                  </label>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Change Password
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Leave these blank if you don't want to change your password.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="Enter current password" autoComplete="current-password" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="Min. 6 characters" autoComplete="new-password" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Repeat new password" autoComplete="new-password" />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Link href="/account/dashboard" className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Email Update Section - Separate from form to avoid nested forms */}
          {enableEmailUpdate && (
            <div className="card" style={{ padding: '2rem', background: '#fffbf0', borderLeft: '4px solid var(--brand-primary)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Update Email Address
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Verify both your current and new email addresses to proceed.
              </p>

              {/* Current Email Verification */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  {existingEmailVerified ? '✓ Current Email Verified' : 'Step 1: Verify Current Email'}
                </h3>
                {!existingEmailVerified ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {user?.email}
                    </p>
                    {!existingEmailOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtpExistingEmail}
                        disabled={verifyingExistingEmail}
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', alignSelf: 'flex-start' }}
                      >
                        {verifyingExistingEmail ? 'Sending…' : 'Send OTP'}
                      </button>
                    ) : (
                      <OtpVerification
                        email={user?.email || ''}
                        type="EXISTING_EMAIL"
                        onVerified={() => setExistingEmailVerified(true)}
                        onCancel={() => setEnableEmailUpdate(false)}
                      />
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', color: '#15803d', fontSize: '0.85rem' }}>
                    ✓ Current email verified successfully
                  </div>
                )}
              </div>

              {/* New Email Section */}
              {existingEmailVerified && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {newEmailVerified ? '✓ New Email Verified' : 'Step 2: Set & Verify New Email'}
                  </h3>

                  {!newEmailVerified ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>New Email Address</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          style={inputStyle}
                          placeholder="your.newemail@example.com"
                          disabled={verifyingNewEmail || newEmailOtpSent}
                        />
                      </div>
                      {!newEmailOtpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtpNewEmail}
                          disabled={verifyingNewEmail || !newEmail}
                          className="btn btn-primary"
                          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', alignSelf: 'flex-start' }}
                        >
                          {verifyingNewEmail ? 'Sending…' : 'Send OTP to New Email'}
                        </button>
                      ) : (
                        <OtpVerification
                          email={newEmail}
                          type="NEW_EMAIL"
                          onVerified={handleCompleteEmailUpdate}
                          onCancel={() => setNewEmail('')}
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', color: '#15803d', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      ✓ New email verified successfully
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
