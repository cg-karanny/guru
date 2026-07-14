'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../account.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setSuccess('An OTP has been sent to your email.');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password updated successfully. Redirecting to login...');
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🛋️</div>
          <h1>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h1>
          <p>{step === 1 ? "Enter your email to receive a reset code." : "Enter the code and your new password."}</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem', color: "green" }}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
              <input id="reset-email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-otp">Verification Code <span style={{ color: 'var(--error)' }}>*</span></label>
              <input id="reset-otp" type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} className="form-control" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-pwd">New Password <span style={{ color: 'var(--error)' }}>*</span></label>
              <input id="reset-pwd" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-control" required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className={styles.options} style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <Link href="/account" className={styles.switchBtn}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
