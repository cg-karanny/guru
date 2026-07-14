'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './about.module.css';

export default function AboutNewsletterForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
    } catch (err) { }
  };

  if (sent) {
    return <div className="alert alert-success" style={{ maxWidth: '400px', margin: '0 auto', display: 'inline-block' }}> Thank you for subscribing!</div>;
  }

  return (
    <form className={styles.subForm} onSubmit={handleSubscribe}>
      <input
        type="email"
        placeholder="Email address"
        className={styles.subInput}
        id="about-newsletter"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary">Join Now</button>
    </form>
  );
}
