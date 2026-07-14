'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';
import AdminSidebar from '@/components/AdminSidebar';
import OtpVerification from '@/components/OtpVerification';



export default function AdminSettingsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/account');
    }
  }, [user, loading, router]);

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

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSiteName(data.siteName || 'Cushion Guru');
        setSiteTagline(data.siteTagline || 'Custom Cushions, Factory Direct');
        setLogoUrl(data.logoUrl || data.siteLogo || '');
      })
      .catch(() => { });
  }, [user]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', logoFile);
    try {
      const res = await fetch('/api/settings', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setLogoUrl(data.logoUrl);
        setLogoFile(null);
        setLogoPreview('');
        const inp = document.getElementById('logoInput') as HTMLInputElement;
        if (inp) inp.value = '';
        // Force reload context
        window.location.reload();
      } else {
        alert(data.error || 'Failed to upload logo');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Remove the current logo? The default icon will be used.')) return;
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: '' }),
      });
      setLogoUrl('');
      window.location.reload();
    } catch {
      alert('Failed to remove logo');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendOtpExistingEmail = async () => {
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
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });
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

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, siteTagline }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        window.location.reload();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save');
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') return <div className={styles.loading}><div className={styles.spinner} /></div>;

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
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Site Settings</h1>
          <Link href="/admin" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>

          {/* Logo Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🖼️ Site Logo
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Upload a custom logo image. It will replace the default 🛋️ icon and site name in the navigation bar. Recommended size: 160×40px or similar landscape ratio.
            </p>

            {/* Current logo preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '160px', height: '60px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Current Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>🛋️</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {logoUrl ? 'Current Logo' : 'No logo uploaded'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {logoUrl ? 'Logo is active across the site' : 'Default icon + site name is shown'}
                </div>
                {logoUrl && (
                  <button onClick={handleRemoveLogo} style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={labelStyle}>Upload New Logo</label>
                <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} style={{ ...inputStyle, background: 'var(--gray-50)', paddingTop: '0.5rem' }} />
              </div>
              <button onClick={handleUploadLogo} className="btn btn-primary" disabled={!logoFile || uploadingLogo} style={{ whiteSpace: 'nowrap' }}>
                {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
              </button>
            </div>
          </div>

          {/* Text Settings */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✏️ Brand Text
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              These values appear throughout the site — in the navbar (when no logo is uploaded), browser tab titles, footer, and admin panel.
            </p>

            <form onSubmit={handleSaveText} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Cushion Guru (leave blank to hide)"
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Shown in the navbar when no logo is uploaded — also used in page titles.</div>
              </div>
              <div>
                <label style={labelStyle}>Site Tagline</label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={e => setSiteTagline(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Custom Cushions, Factory Direct"
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Short description shown in the footer and metadata.</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saved && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>✓ Saved successfully!</span>}
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 Change Password
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Update your admin account password.</p>

            {passwordMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  background: passwordMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${passwordMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: passwordMessage.type === 'success' ? '#15803d' : '#dc2626',
                  fontSize: '0.85rem',
                }}
              >
                {passwordMessage.type === 'success' ? '✓ ' : '✕ '}{passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={inputStyle}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPassword} style={{ alignSelf: 'flex-start' }}>
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Update Email */}
          <div className="card" style={{ padding: '2rem', background: '#fffbf0', borderLeft: '4px solid var(--brand-primary)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📧 Update Email Address
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Update your admin account email address.</p>

            {emailMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  background: emailMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${emailMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: emailMessage.type === 'success' ? '#15803d' : '#dc2626',
                  fontSize: '0.85rem',
                }}
              >
                {emailMessage.type === 'success' ? '✓ ' : '✕ '}{emailMessage.text}
              </div>
            )}

            {!enableEmailUpdate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="enableAdminEmailUpdate"
                  checked={enableEmailUpdate}
                  onChange={(e) => setEnableEmailUpdate(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  htmlFor="enableAdminEmailUpdate"
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  Click to enable email update
                </label>
              </div>
            )}

            {enableEmailUpdate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Current Email Verification */}
                <div>
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
                            placeholder="admin.newemail@example.com"
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

          {/* Live Preview */}
          <div className="card" style={{ padding: '2rem', background: '#0d2438' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
              👁️ Navbar Preview
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', width: 'fit-content', maxWidth: '100%', flexWrap: 'wrap' }}>
              {(logoPreview || logoUrl)
                ? <img src={logoPreview || logoUrl} alt="logo" style={{ height: '36px', width: 'auto', objectFit: 'contain', maxWidth: '140px' }} />
                : <span style={{ fontSize: '1.5rem' }}>🛋️</span>
              }
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>{siteName || 'Cushion Guru'}</span>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>This is how your brand appears in the navigation bar.</div>
          </div>

        </div>
      </main>
    </div>
  );
}
