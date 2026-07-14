'use client';

import React, { useState, useEffect } from 'react';
import styles from './Newsletter.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Newsletter() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSent(true); setEmail(''); }
      else { const d = await res.json(); setError(d.error ?? 'Failed'); }
    } catch { setError('Network error. Please try again.'); }
  };

  return (
    <section className={styles.section} aria-label="Newsletter signup">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.text}>
            <span className={styles.eyebrow}>Exclusive Offers</span>
            <h2>Stay Updated with Our Latest Designs</h2>
            <p>Join our mailing list and never miss a deal!</p>
          </div>
          {sent ? (
            <div className="alert alert-success"> Thank you! You&rsquo;re on the list.</div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
              <div className={styles.inputRow}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                  id="newsletter-email"
                  required
                />
                <button type="submit" className="btn btn-accent">Join Now</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
