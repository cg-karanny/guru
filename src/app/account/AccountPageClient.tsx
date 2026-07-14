'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './account.module.css';

export default function AccountPageClient() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/account/dashboard');
    }
  }, [user, router]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    if (mode === 'login') {
      const result = await login(form.email, form.password);
      if (result.ok) {
        router.push('/account/dashboard');
      } else {
        setError(result.error ?? 'Something went wrong');
      }
    } else {
      if (!termsAccepted) {
        setError('You must accept the Terms & Conditions to create an account.');
        setLoading(false);
        return;
      }
      const result = await register(form.name, form.email, form.password, showOtp ? otp : undefined);
      if (result.requireOtp) {
        setShowOtp(true);
      } else if (result.ok) {
        router.push('/account/dashboard');
      } else {
        setError(result.error ?? 'Something went wrong');
      }
    }
    setLoading(false);
  };

  const handleTabSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setShowOtp(false);
    setOtp('');
    setTermsAccepted(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`} onClick={() => handleTabSwitch('login')}>
            Login
          </button>
          <button className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`} onClick={() => handleTabSwitch('register')}>
            Register
          </button>
        </div>

        <div className={styles.header}>
          {/* <div className={styles.logo}>🛋️</div> */}
          <div className={styles.logoWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className={styles.logoIcon}
            >
              <g strokeWidth="0">
                <path d="M201 83.1c-42.9 2.4-82.8 8.1-116.8 16.6l-14.4 3.6-4.4-5.1c-3-3.4-6.7-6.2-11.2-8.4-6.2-3.1-7.4-3.3-16.7-3.3s-10.5.2-16.7 3.3C7.6 96.3.6 107.8.6 123c0 10.2 2.5 17.6 8.3 24.1 3.8 4.4 3.8 4.4 2.4 8.4-2.5 7.1-7.2 32.6-9 48.5-2.4 22-2.4 82 0 104 1.8 15.9 6.5 41.4 9 48.5 1.4 4 1.4 4-2.4 8.4-7.9 8.9-10.7 22.9-7 34.7 3.7 11.9 11.3 20.1 23 24.5 4.5 1.6 7.3 2 14.1 1.7 11-.4 19.7-4.4 26.4-12l4.4-5.1 14.4 3.6c49.2 12.3 102 17.7 171.8 17.7 69.6 0 122.7-5.5 171.8-17.7l14.4-3.6 4.4 5.1c3 3.4 6.7 6.2 11.2 8.4 6.2 3.1 7.4 3.3 16.7 3.3s10.5-.2 16.7-3.3c13.2-6.5 20.2-18 20.2-33.2 0-10.2-2.5-17.6-8.3-24.1-3.8-4.3-3.8-4.4-2.5-8.3 6.5-18.6 11.4-62 11.4-100.6s-4.9-82-11.4-100.6c-1.3-3.9-1.3-4 2.5-8.3 5.8-6.5 8.3-13.9 8.3-24.1 0-15.2-7-26.7-20.2-33.2-6.2-3.1-7.4-3.3-16.7-3.3s-10.5.2-16.7 3.3c-4.5 2.2-8.2 5-11.2 8.4l-4.4 5.1-14.4-3.6C392.4 90.9 354.5 85.6 308 83c-20.4-1.1-86-1.1-107 .1m129 15.3c45.1 4 77.4 9.7 112.8 19.8 5 1.5 6.7.7 9.9-4.3 6.6-10.4 12-13.8 21.6-13.9 10.1 0 17 4.3 21.3 13.5 4.6 9.6 2 20.1-7 28.2-2.5 2.3-4.6 4.9-4.6 5.8 0 .8 1.3 6.1 3 11.5 6.6 22.4 9.8 47.5 10.7 85 1 45.1-2.8 83.1-11.2 110.6-1.4 4.5-2.5 8.9-2.5 9.9 0 .9 2.1 3.5 4.6 5.8 9 8.1 11.6 18.5 7 28.2-4 8.8-11.4 13.5-21.1 13.5-9 0-16.5-4.3-20.2-11.5-2.2-4.3-5.4-7.5-7.4-7.5-1 0-7.2 1.6-13.9 3.5-31.4 9-76 15.6-125.5 18.5-21.9 1.3-81.1 1.3-103 0-49.5-2.9-94.1-9.5-125.5-18.5-6.7-1.9-12.9-3.5-13.9-3.5-2 0-5.2 3.2-7.4 7.5C54 407.7 46.5 412 37.5 412c-9.9 0-16.8-4.4-21.1-13.5-4.6-9.7-2.7-18.2 5.8-26.9 3.2-3.2 5.8-6.5 5.8-7.2 0-.8-1.3-6-3-11.4-14.8-49.9-14.8-144.1 0-194 1.7-5.4 3-10.6 3-11.4 0-.7-2.6-4-5.8-7.2-8.5-8.7-10.4-17.2-5.8-26.9 4.3-9.1 11.2-13.5 21.1-13.5 9 0 16.5 4.3 20.2 11.5 2.2 4.3 5.4 7.5 7.4 7.5 1 0 7.2-1.6 13.8-3.5 32.3-9.3 75.7-15.6 130.6-18.9 16.1-1 104 .4 120.5 1.8" /><path d="m54 181.5-2.3 2.5 1.7 14.2c3 25.3 4 55.4 2.8 79.6-.6 11.9-1.9 28.1-2.8 36L51.7 328l2.3 2.5c2.9 3.1 6.4 3.2 9.4.2 2.4-2.5 3.2-6.9 5.7-32.2 1.6-15.5 1.6-69.5 0-85-2.5-25.3-3.3-29.7-5.7-32.2-3-3-6.5-2.9-9.4.2m394.6-.2c-2.4 2.5-3.2 6.9-5.7 32.2-1.6 15.5-1.6 69.5 0 85 2.5 25.3 3.3 29.7 5.7 32.2 3 3 6.5 2.9 9.4-.2l2.3-2.5-1.7-14.2c-3-25.3-4-55.4-2.8-79.6.6-11.9 1.9-28.1 2.8-36l1.7-14.2-2.3-2.5c-2.9-3.1-6.4-3.2-9.4-.2" />
              </g>
            </svg>
          </div>
          <h1>{showOtp ? 'Verify Email' : (mode === 'login' ? 'Welcome Back' : 'Create Account')}</h1>
          <p>{showOtp ? 'Enter the verification code sent to your email.' : (mode === 'login' ? 'Sign in to your Cushion Guru account' : 'Join Cushion Guru for custom cushions')}</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {showOtp ? (
            <div className="form-group">
              <label className="form-label" htmlFor="acc-otp">Verification Code <span style={{ color: 'var(--error)' }}>*</span></label>
              <input id="acc-otp" name="otp" type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} className="form-control" required autoFocus />
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="acc-name">Full Name <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input id="acc-name" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleInput} className="form-control" required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="acc-email">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
                <input id="acc-email" name="email" type="email" placeholder="Email address" value={form.email} onChange={handleInput} className="form-control" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="acc-pwd">Password <span style={{ color: 'var(--error)' }}>*</span></label>
                <div className={styles.pwdWrap}>
                  <input
                    id="acc-pwd"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={form.password}
                    onChange={handleInput}
                    className="form-control"
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)} aria-label="Toggle password visibility">
                    {showPwd ? (
                      /* Modern Open Eye - Simplified circular iris */
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      /* Modern Eye Off - Clean diagonal slash */
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className={styles.options}>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="remember" checked={form.remember} onChange={handleInput} id="remember-me" />
                Remember me
              </label>
              <Link href="/account/forgot-password" className={styles.forgot}>Lost your password?</Link>
            </div>
          )}

          {mode === 'register' && !showOtp && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="terms-accept"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ width: '16px', height: '16px', marginTop: '3px', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="terms-accept" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: 'var(--brand-primary)', fontWeight: 600 }} target="_blank">Terms &amp; Conditions</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" style={{ color: 'var(--brand-primary)', fontWeight: 600 }} target="_blank">Privacy Policy</Link>
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading} id="account-submit">
            {loading ? (mode === 'login' ? 'Signing in…' : (showOtp ? 'Verifying…' : 'Sending Code…')) : (mode === 'login' ? 'Log In' : (showOtp ? 'Verify Code' : 'Create Account'))}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>
        <p className={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className={styles.switchBtn} onClick={() => handleTabSwitch(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
