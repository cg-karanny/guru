'use client';

import React, { useState } from 'react';
import styles from './faq.module.css';

const FAQS = [
  { q: 'What sizes do your cushions come in?', a: 'Our cushions are custom-made to fit your specific needs. You can choose any combination of length, width, and thickness for both seat and back cushions / all kinds of cushions.' },
  { q: 'What fabric options do you offer for cushions?', a: 'We exclusively offer Sunbrella fabric, renowned for its exceptional durability, fade resistance, and ease of maintenance.' },
  { q: 'How long does it take to receive my custom cushions?', a: 'Since each order is unique, it typically takes 3–4 weeks from the time you provide your dimensions until we dispatch your custom cushions. However, we often deliver sooner.' },
  { q: 'Are the cushion covers removable for washing?', a: 'Yes, all our cushions come with removable covers for easy cleaning or replacement.' },
  { q: 'Do your cushions include zippers?', a: 'Yes, all our cushions feature zippers, typically placed on the back for easy access. We use high-quality YKK zippers in various colors.' },
  { q: 'Where are your cushions made?', a: 'Our cushions are crafted in our workrooms located in India and the USA. However, our headquarters are based in New York, USA.' },
  { q: 'Do you provide cushions with piping or welting?', a: 'Yes, we offer cushions with optional piping, which enhances durability and adds a refined look.' },
  { q: 'Why Sunbrella fabrics?', a: 'Sunbrella fabric is renowned for its exceptional durability, fade resistance, and ease of maintenance. It\'s perfect for outdoor and indoor environments.' },
  { q: 'What types of foam do you use for cushion inserts?', a: 'We offer a variety of foam options including standard foam, high-density foam, and Dry Fast Foam ideal for outdoor use.' },
  { q: 'Can I request cushions in specific shapes or sizes not listed on the website?', a: 'Absolutely! We can accommodate custom shapes and sizes to fit your unique seating requirements. Simply provide us with your specifications.' },
  { q: 'Do you offer stain-resistant fabrics for cushions?', a: 'Yes, Sunbrella fabric offers unmatched durability, fade resistance, and easy maintenance — making it stain-resistant by nature.' },
  { q: 'What is batting, and do your cushions include it?', a: 'Batting is a material layered between the cushion cover and foam. Yes, our cushions include batting to enhance comfort and durability.' },
  { q: 'Do you offer trade discounts for large commercial orders?', a: 'Yes, we provide trade discounts for bulk orders. Please reach out to contact@cushionguru.com to discuss your specific requirements.' },
  { q: 'What is your refund/return policy?', a: 'Due to the customized nature of our products, we do not offer refunds or returns. However, if your cushions are damaged or don\'t match specs within a 1-inch tolerance, we will replace them.' },
  { q: 'Is there a warranty on your cushions?', a: 'Yes, we offer a two-year limited warranty on workmanship from the date of purchase.' },
  { q: 'Is there a warranty provided by Sunbrella for upholstery fabric?', a: 'Yes, Sunbrella typically offers a 5-year warranty on their upholstery fabric.' },
  { q: 'Do you offer wholesale pricing for businesses?', a: 'Yes, we offer wholesale pricing for businesses. Email contact@cushionguru.com for inquiries.' },
  { q: 'Can I see a preview of my custom order before finalizing it?', a: 'Yes, you can review a customization summary of your order at the bottom of the product page before finalizing your purchase.' },
  { q: 'Do you offer international shipping?', a: 'Yes, we offer international shipping to many countries. Please contact our customer support for rates and delivery times.' },
  { q: 'Can I order replacement cushion covers without purchasing new inserts?', a: 'Yes, we offer replacement cushion covers separately from inserts.' },
  { q: 'How do I clean and maintain my cushions?', a: 'Cleaning and maintenance instructions are available in our Cleaning section.' },
  { q: 'Can I order cushions for outdoor furniture?', a: 'Yes, we offer cushions specifically designed for outdoor use, made from durable weather-resistant materials.' },
  { q: 'Do you offer custom cushion shapes, such as trapezoid or circle?', a: 'Yes, we can create custom cushion shapes. Contact our customer support team to discuss your requirements.' },
  { q: 'Are your cushions suitable for use in commercial settings?', a: 'Yes, our cushions are suitable for commercial use. Contact our sales team for bulk ordering and customization options.' },
  { q: 'Do you offer assistance with cushion design for large seating areas?', a: 'Yes, our team can provide design assistance and layout recommendations for large seating areas.' },
  { q: 'Can I order cushions with different fabrics on each side?', a: 'Yes, we offer reversible cushions with different fabrics on each side.' },
  { q: 'Are your cushions suitable for both indoor and outdoor use?', a: 'Yes, we offer cushions versatile enough for both indoor and outdoor applications.' },
  { q: 'Do you offer custom piping options for cushions?', a: 'Yes, we offer custom piping options to complement your cushion design.' },
  { q: 'Can I order cushions with custom tufting or button detailing?', a: 'Yes, we offer custom tufting and button detailing options.' },
  { q: 'What types of closures do your cushions have?', a: 'Our cushions typically feature zipper closures. We can accommodate other closure options upon request.' },
  { q: 'Do you offer OEM, ODM or white labelling?', a: 'Yes, we offer OEM, ODM and White labelling. Contact us to discuss your branding needs.' },
  { q: 'What is your process for resolving issues with damaged or incorrect orders?', a: 'Contact our customer support team immediately. We will work quickly to resolve any issues and ensure your complete satisfaction.' },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={styles.accordion}>
      {FAQS.map((faq, i) => (
        <div key={i} className={`${styles.item} ${open === i ? styles.open : ''}`}>
          <button
            className={styles.question}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            id={`faq-${i}`}
          >
            <span>{faq.q}</span>
            <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open === i && (
            <div className={styles.answer} role="region" aria-labelledby={`faq-${i}`}>
              <p>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion;
