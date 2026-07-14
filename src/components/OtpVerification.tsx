'use client';

import React, { useState, useEffect } from 'react';

interface OtpVerificationProps {
  email: string;
  type: 'EXISTING_EMAIL' | 'NEW_EMAIL';
  onVerified?: () => void;
  onCancel?: () => void;
}

export default function OtpVerification({ email, type, onVerified, onCancel }: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!otp || otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setOtp('');
        setTimeout(() => {
          onVerified?.();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to verify OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (attempts >= MAX_ATTEMPTS) {
      setMessage({ type: 'error', text: 'Maximum resend attempts reached. Please try again later.' });
      return;
    }

    setMessage(null);
    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'OTP resent successfully!' });
        setResendTimer(60);
        setAttempts(prev => prev + 1);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to resend OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    background: 'white',
    boxSizing: 'border-box',
    letterSpacing: '0.2em',
    textAlign: 'center',
    fontWeight: 'bold',
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

  return (
    <div style={{ padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#15803d' : '#dc2626',
            fontSize: '0.85rem',
          }}
        >
          {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
        </div>
      )}

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>
            {type === 'EXISTING_EMAIL' ? 'Verify Current Email' : 'Verify New Email'}
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0' }}>
            Enter the 6-digit OTP sent to {email}
          </p>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={inputStyle}
            placeholder="000000"
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.length !== 6}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading || resendTimer > 0 || attempts >= MAX_ATTEMPTS}
            style={{
              background: 'none',
              border: 'none',
              color: (resendTimer > 0 || attempts >= MAX_ATTEMPTS) ? 'var(--text-muted)' : 'var(--brand-primary)',
              cursor: (resendTimer > 0 || attempts >= MAX_ATTEMPTS) ? 'default' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: 0,
            }}
          >
            {attempts >= MAX_ATTEMPTS ? 'Max attempts reached' : resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
          </button>
        </div>
      </form>

      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            marginTop: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
