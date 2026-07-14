'use client';

import React, { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: string) => {
    localStorage.setItem('cookie_consent', level);
    setShowBanner(false);
    
    // Dispatch a custom event so other scripts can react to the consent choice
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: { level } }));
  };

  if (!showBanner) return null;

  return (
    <div className={styles.cookieOverlay}>
      <div className={styles.cookieBanner}>
        <div className={styles.cookieContent}>
          <h3>We value your privacy</h3>
          <p>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        <div className={styles.cookieActions}>
          <button 
            className={`btn btn-primary ${styles.btn}`} 
            onClick={() => handleConsent('all')}
          >
            Accept All
          </button>
          <button 
            className={`btn ${styles.btnOutline}`} 
            onClick={() => handleConsent('essential')}
          >
            Essential Only
          </button>
          <button 
            className={`btn ${styles.btnGhost}`} 
            onClick={() => handleConsent('rejected')}
          >
            Reject All
          </button>
        </div>
      </div>
    </div>
  );
}
