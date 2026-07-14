'use client';

import React, { useState } from 'react';
import styles from './contact.module.css';
import Newsletter from '@/components/home/Newsletter';

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSent(true); setForm({ name: '', email: '', message: '' }); }
      else { const d = await res.json(); setError(d.error ?? 'Failed'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className="badge">Get in Touch</span>
            <h1>Our friendly team is always here to chat.</h1>
            <p>We&rsquo;re here for you · Contact Us</p>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className={`section-padding ${styles.section}`}>
        <div className="container">
          <div className={styles.grid}>
            {/* Form */}
            <div className={styles.formSide}>
              <h2>Get In Touch</h2>
              <p className={styles.subtext}>Your email address will not be published. Required fields are marked <span style={{ color: 'var(--error)' }}>*</span></p>

              {sent ? (
                <div className="alert alert-success" style={{ marginTop: '2rem' }}>
                  ✅ Thank you! We&rsquo;ll get back to you within 24 hours.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {error && <div className="alert alert-error">{error}</div>}
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">Name <span>*</span></label>
                    <input id="contact-name" name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleInput} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">Email <span>*</span></label>
                    <input id="contact-email" name="email" type="email" placeholder="Your Email Address" value={form.email} onChange={handleInput} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">Message <span>*</span></label>
                    <textarea id="contact-message" name="message" placeholder="Your question or message" value={form.message} onChange={handleInput} className="form-control" rows={6} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading} id="contact-submit">
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Map + Info */}
            <div className={styles.infoSide}>
              {/* Google Map placeholder */}
              <div className={styles.map}>
                <iframe
                  title="Cushion Guru HQ"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.280283884474!2d-73.48363902450048!3d40.73385773627808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c28011bcc83d2f%3A0xeb13109b6912b256!2s328%20Stewart%20Ave%2C%20Bethpage%2C%20NY%2011714%2C%20USA!5e0!3m2!1sen!2sin!4v1778599269324!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  {/* <span>📍</span> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512"><g strokeWidth="0"><path d="M243.5.6c-1.6.2-6.8.9-11.5 1.5-56.1 7.5-108 48.7-129 102.6-8.4 21.4-11.4 37.5-11.4 61.8-.1 24.4 4 44 13.5 65.6 5.1 11.6 5.1 11.7 37.8 62.9 14.9 23.3 26.7 42.7 26.3 43.1s-5.2 1.4-10.7 2.4c-36.9 6.5-74.8 19.8-96.5 34.1-21.9 14.3-33.5 35-30.3 53.9 3.4 19.7 19.4 37 46.8 50.4 71.4 35.1 202 43.4 300.3 19.1 42.6-10.5 76-27.3 90.4-45.3 19.5-24.6 14-53.3-14.3-74.6-20.5-15.5-61.2-30.6-101.4-37.6-5.5-1-10.3-2-10.7-2.4s12.3-21.1 28.3-46.1 31-49.6 33.4-54.5c6-12.6 10.1-24.7 13.2-39.4 2.3-11 2.7-15 2.7-30.6 0-9.9-.6-21.6-1.3-26C407.9 70.2 353.5 14.7 283 2.5 274.6 1 249.2-.2 243.5.6m39.2 32.3c51.2 10.5 91.3 49.3 104.2 100.6 7.7 31 3.8 65.6-10.6 93.2C371.6 235.6 257 416 256 416c-.3 0-21.9-33.6-48-74.7-26.1-41-52.6-82.5-58.8-92.2s-12.9-21-14.9-25.1c-27.6-57.8-10.5-127.8 40.6-166.4 19.8-14.9 42-23.7 68.1-27 7.9-1 29.8.3 39.7 2.3m-66.2 377.6c20.3 31.7 29 44.6 31.4 46.2 4.6 3.1 11.6 3.1 16.2 0 2.4-1.6 11.2-14.5 31.4-46.2l28.1-44 3.9.3c2.2.1 9.4 1.2 16 2.3 46.8 7.9 81.8 21.3 98.6 37.9 11.7 11.6 11.7 18.6.1 30-21.8 21.2-71.7 36.6-139.7 43.2-17.1 1.6-77.1 1.6-93.5 0-36.5-3.7-63.9-8.9-88.5-16.8-23.8-7.6-40.1-16.1-50.7-26.4-10.9-10.6-11.4-17.7-2-28.1 13.4-14.9 45.1-28.7 84.8-36.8 16.4-3.4 32.1-6 34.4-5.7.8 0 14.1 19.9 29.5 44.1" /><path d="M246.5 91.6c-1.1.2-4.5.9-7.5 1.5-21.7 4.4-42.9 22.4-52.2 44.4-4.1 9.7-5.3 16.2-5.3 28.5s1.2 18.8 5.3 28.5c9.3 21.9 29 38.7 52.2 44.6 7.1 1.8 26.9 1.8 34 0 23.2-5.9 42.9-22.7 52.2-44.6 4.1-9.7 5.3-16.2 5.3-28.5 0-6.5-.6-13.9-1.4-17-6.8-26.9-27.7-48.2-54.6-55.7-5.1-1.4-24.3-2.6-28-1.7m17.6 30.4c23.5 4.5 39.9 27.5 36.1 50.6-3.2 19.6-18 34.4-37.6 37.6-28.9 4.8-55.6-21.9-50.8-50.8 4.2-25.2 27.7-42 52.3-37.4" /></g></svg>

                  <div>
                    <strong>Address</strong>
                    <p>328 Stewart Avenue, Bethpage, New York 11714
                      <br />
                      <b>(Not a walk-in store)</b>
                    </p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  {/* <span>✉️</span> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512"><path d="M34.5 77.4c-8.4 2.1-14.7 5.7-21.1 12.1C6.9 96 2.9 103.1 1.1 111.8c-1.6 7.6-1.6 281 0 288.4 3.7 17.1 17.7 31.1 34.7 34.7 7.5 1.6 432.9 1.6 440.4 0 17-3.6 31.1-17.8 34.7-34.7 1.6-7.6 1.6-281 0-288.4-3.7-17.2-17.6-31.1-34.7-34.7-8.1-1.7-434.9-1.4-441.7.3m329 125.7c-53.4 53.3-98.2 97.7-99.7 98.5-3.5 1.8-12.1 1.8-15.6 0-1.5-.8-46.3-45.2-99.7-98.5l-97-97.1h409zM94.7 320.7 30 385.5v-259l64.7 64.8 64.8 64.7zM482 256.2v129.3l-64.7-64.7-64.8-64.8 64.5-64.5c35.5-35.5 64.6-64.5 64.7-64.5.2 0 .3 58.2.3 129.2m-278.1 45.1c21.5 21.3 24.3 23.7 31.5 27.3l8 3.9h12.5c12.5 0 12.7 0 20.5-3.8 7.3-3.5 9.6-5.5 31.8-27.4l23.9-23.7 64.2 64.2 64.2 64.2h-409l64-64c35.2-35.2 64.2-64 64.4-64 .3 0 11.1 10.5 24 23.3" /></svg>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:contact@cushionguru.com" target="_blank" rel="noopener noreferrer">contact@cushionguru.com</a>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  {/* <span>📞</span> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512"><path d="M91.6 1.5c-8.1 2.1-16.4 6.7-24.9 14-9.4 8.1-43.1 42.4-48.6 49.5C-4.2 93.5-4.6 137.8 17 195c26.3 69.9 75.6 140.7 138 198.2 86 79.3 201.2 130.6 260.5 116.2 8.8-2.1 23.4-8.9 30.1-14 6.8-5.1 52-51.5 56.2-57.6 7.8-11.3 10.8-26.4 7.8-39.2-3.4-14.3-4.5-15.6-48-59.2-43.9-43.9-45.3-45-59.8-48-11.5-2.4-23.2-.3-34.5 6.2-2.6 1.6-15 12.9-27.5 25.3l-22.7 22.4-7.3-3.8c-17.9-9.3-31.1-18.2-50.8-34.4-20.2-16.6-48.4-45.7-64-66.1-11.3-14.8-27.9-42.1-28-45.8 0-.7 7.8-8.9 17.3-18.2 20-19.5 27.9-28.6 32.4-37.2 5.6-10.9 6.7-24.7 2.8-36.1-3.9-11.6-7.7-16-45.9-54.3C135.8 11.6 130 6.6 119.2 2.9 111.7.2 99.3-.4 91.6 1.5m23.2 28.1c2.8 1.6 18.8 16.7 40.3 38.3 38.9 39 40.4 40.8 40.3 51.1 0 9.1-2.4 12.3-28.5 38.4-13.2 13.1-24.7 25.2-25.5 26.9-1.2 2.1-1.5 5-1.2 9.9.3 6 1.1 8.3 7.2 20.4 13.8 27.4 32 51.5 62.1 82.3 29.9 30.6 59.7 53.4 90.4 69.2 10.9 5.6 13 6.4 18 6.3 3.4 0 7-.7 9.1-1.8 1.9-1 14.3-12.6 27.5-25.7 17-16.9 25.3-24.4 28.5-25.8 6-2.7 13.8-2.7 19.3 0 6 3 76.7 73.6 79.8 79.8 1.7 3.3 2.4 6.3 2.4 10.6 0 10.3-2.1 13.1-30.5 41.6-28.1 28.2-30.7 30.1-45.7 33.5-14.5 3.2-38.8.6-63.4-6.7-37.5-11.1-87.9-37.7-129.4-68.3-79.9-58.8-148.5-148.7-177-231.8C24.9 138.3 23.4 110 33.8 89c3.2-6.7 6.2-10.1 27-31.2C73.6 44.8 85.9 33 88 31.5c9-6.2 18.2-6.9 26.8-1.9" /></svg>
                  <div>
                    <strong>Phone</strong>
                    <p>+1 (516) 526-8108</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  {/* <span>🌐</span> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512"><path d="M238 .6c-1.9.2-7.8.9-13 1.4-33 3.6-69.5 16-99 33.6C88.5 58 58 88.5 35.6 126c-17.5 29.2-29.1 63.2-33.8 99-1.6 12.3-1.6 49.7 0 62 8.2 62.3 35.6 115 82 158.1 25.6 23.9 57.5 42.5 92.2 53.9 27.4 9.1 49.1 12.4 80 12.4 22.8 0 32.9-.9 53-5 68.9-14.1 130.4-58.3 167.4-120.4 17.5-29.2 29.1-63.2 33.8-99 1.6-12.3 1.6-49.7 0-62-4.7-35.8-16.3-69.8-33.8-99C454 88.5 423.5 58 386 35.6 357.1 18.3 322.6 6.5 288 2 279.2.8 244.2-.1 238 .6m24.7 16.9c16.5 6.9 32.2 36 44.7 82.6 1.4 5.3 2.6 9.9 2.6 10.3 0 .3-24.3.6-54 .6s-54-.3-54-.6c0-.4 1.2-5 2.6-10.3 16.1-60.2 37.8-91.1 58.1-82.6m-45.5 8.7c-10.7 15.9-20.7 40.9-28.5 71.3l-3.4 13-32.6.3c-18 .1-32.7-.1-32.7-.4 0-1 6.9-12.3 12.8-20.9 21.2-30.8 48.8-53.6 78.7-65.1 8.5-3.3 9-3.1 5.7 1.8m83-1.8c29.8 11.2 57.7 34.2 79 65.1 5.9 8.6 12.8 19.9 12.8 20.9 0 .3-14.7.5-32.7.4l-32.6-.3-3.4-13c-7.8-30.4-17.8-55.4-28.5-71.3-1.6-2.3-2.4-4.2-1.9-4.2.6 0 3.9 1.1 7.3 2.4M146.7 48.2c-16.4 16.2-29.9 34.3-40.8 54.5l-4.4 8.3H64.9l2.1-2.8C82.8 88 103.5 69 125.5 54.7c8.7-5.6 30.5-17.7 32-17.7.3 0-4.6 5.1-10.8 11.2m224.8-2.5c28.7 16 53.9 37.5 73.5 62.5l2.1 2.8h-36.6l-4.4-8.3c-10.9-20.2-24.4-38.3-40.8-54.5-12.9-12.7-12.4-12.9 6.2-2.5M93 128c0 .5-1.3 4.2-2.9 8.2-11.1 27.9-19.3 66.8-20.8 98l-.6 13.8H15.9l.6-6.8C20 201 28.6 171.5 46.3 139.7l7-12.7h19.9c12.2 0 19.8.4 19.8 1m89-.3c0 .5-.9 6-2 12.3-4 23.4-7.1 56.6-8.6 92.2l-.6 15.8H85v-7c0-12.6 3.2-37.6 7.2-56 2.8-13.3 8.1-30.3 13.9-45.3l5.1-12.7h35.4c19.5 0 35.4.3 35.4.7m134.3 16.5c4.7 30.1 6.7 51.2 8.2 89l.7 14.8H186.8l.7-14.8c1.5-37.8 3.5-58.9 8.2-89l2.7-17.2h115.2zm89.6-4.5c5.8 15 11.1 32 13.9 45.3 4 18.4 7.2 43.4 7.2 56v7h-85.8l-.6-15.8c-1.5-35.6-4.6-68.8-8.6-92.2-1.1-6.3-2-11.8-2-12.3 0-.4 15.9-.7 35.4-.7h35.4zm59.8 0c17.7 31.8 26.3 61.3 29.8 101.5l.6 6.8h-52.8l-.6-13.8c-1.5-31.2-9.7-70.1-20.8-98-1.6-4-2.9-7.7-2.9-8.2 0-.6 7.6-1 19.8-1h19.9zm-396.4 138c1.5 31.3 9.7 70.2 20.8 98.1 1.6 4 2.9 7.7 2.9 8.2 0 .6-7.6 1-19.8 1H53.3l-7-12.8C28.6 340.5 20 311 16.5 270.7l-.6-6.7h52.8zm102.1 2c1.5 35.7 4.6 68.9 8.6 92.3 1.1 6.3 2 11.8 2 12.2 0 .5-15.9.8-35.4.8h-35.4l-5.1-12.8c-5.8-14.9-11.1-31.9-13.9-45.2-4-18.4-7.2-43.4-7.2-56v-7h85.8zm153.1-1c-1.5 37.9-3.5 59-8.2 89l-2.7 17.3H198.4l-2.7-17.3c-4.7-30-6.7-51.1-8.2-89l-.7-14.7h138.4zM427 271c0 12.6-3.2 37.6-7.2 56-2.8 13.3-8.1 30.3-13.9 45.2l-5.1 12.8h-35.4c-19.5 0-35.4-.3-35.4-.8 0-.4.9-5.9 2-12.2 4-23.4 7.1-56.6 8.6-92.3l.6-15.7H427zm68.5-.3c-3.5 40.3-12.1 69.8-29.8 101.5l-7 12.8h-19.9c-12.2 0-19.8-.4-19.8-1 0-.5 1.3-4.2 2.9-8.2 11.1-27.9 19.3-66.8 20.8-98.1l.6-13.7h52.8zM105.9 409.3c10.9 20.2 24.4 38.3 40.8 54.5 12.9 12.7 12.4 12.9-6.2 2.5-28.7-16-53.9-37.5-73.5-62.6l-2.1-2.7h36.6zm82.8 5.2c7.8 30.4 17.8 55.4 28.5 71.2 1.6 2.4 2.4 4.3 1.9 4.3-1.9 0-13.5-4.7-20.9-8.4-24.7-12.4-47.3-32.9-65.4-59.1-5.9-8.6-12.8-19.9-12.8-20.9 0-.3 14.7-.5 32.7-.4l32.6.3zM310 401.6c0 .4-1.2 5-2.6 10.3-15.1 56.6-35.3 87.3-54.8 83.7-14.4-2.7-30.9-27.9-42.6-65-2.8-8.9-8-27.8-8-29 0-.3 24.3-.6 54-.6s54 .3 54 .6m82 0c0 1-7 12.3-12.8 20.9-18.1 26.2-40.7 46.7-65.4 59.1-7.4 3.7-19 8.4-20.9 8.4-.5 0 .3-1.9 1.9-4.3 10.6-15.7 21.5-42.9 28.7-71.7 1.4-5.8 2.8-11.1 3-11.8.3-.9 7.8-1.2 33-1.2 17.9 0 32.5.3 32.5.6m53 2.1c-19.6 25.1-44.8 46.6-73.5 62.6-18.6 10.4-19.1 10.2-6.2-2.5 16.4-16.2 29.9-34.3 40.8-54.5l4.4-8.3h36.6z" /></svg>
                  <div>
                    <strong>Website</strong>
                    <a href="https://cushionguru.com" target="_blank" rel="noopener noreferrer">cushionguru.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
