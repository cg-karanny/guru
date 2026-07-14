import type { Metadata } from 'next';
import styles from './legal.module.css';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Cushion Guru Terms & Conditions. Read our policies on quality assurance, customization, payment, shipping, returns, and more.',
};

const TERMS = [
  { num: '1', title: 'Quality Assurance', text: 'Cushion Guru is committed to providing the highest quality fabric for our customizable cushion covers. Through our partnership with Sunbrella, we ensure that our fabric meets the highest standards of durability, colorfastness, and performance.' },
  { num: '2', title: 'Customization Options', text: 'We offer unlimited customization options to tailor your cushion covers to your exact preferences. From size and shape to color and pattern, you have the freedom to create a cushion cover that perfectly complements your space.' },
  { num: '3', title: 'Order Placement', text: 'Orders can be placed through our website or by contacting our customer service team directly. By placing an order, you agree to abide by these Terms & Conditions.' },
  { num: '4', title: 'Payment', text: 'Payment must be made in full at the time of ordering. We accept all major credit cards and Stripe. Prices are listed in your preferred currency and are subject to change without notice.' },
  { num: '5', title: 'Production and Shipping', text: 'Each cushion cover is custom-made to order. Please allow a production time of 3–4 business weeks, excluding shipping time. Shipping costs and delivery times vary depending on your location. We offer both standard and expedited shipping options.' },
  { num: '6', title: 'Returns and Exchanges', text: 'Due to the customized nature of our products, all sales are final. We do not accept returns or exchanges unless the product is defective or damaged upon arrival. If you receive a defective or damaged product, please contact us within 7 days of receiving your order to arrange for a replacement.' },
  { num: '7', title: 'Intellectual Property', text: 'All designs, patterns, and artwork used in the customization of our cushion covers are the intellectual property of Cushion Guru. Any unauthorized use or reproduction of our designs is strictly prohibited.' },
  { num: '8', title: 'Privacy Policy', text: 'We respect your privacy and are committed to protecting your personal information. Please review our Privacy Policy for details on how we collect, use, and safeguard your data.' },
  { num: '9', title: 'Limitation of Liability', text: 'Cushion Guru shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use or inability to use our products.' },
  { num: '10', title: 'Governing Law', text: 'These Terms & Conditions shall be governed by and construed in accordance with the laws of USA. Any disputes arising under these Terms & Conditions shall be subject to the exclusive jurisdiction of the courts in USA.' },
];

export default function TermsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container text-center">
          <h1>Cushion Guru Terms &amp; Conditions</h1>
          <p>Please read these terms carefully before placing an order</p>
        </div>
      </section>
      <section className={`section-padding ${styles.section}`}>
        <div className="container-narrow">
          <div className={styles.intro}>
            By placing an order with Cushion Guru, you acknowledge that you have read, understood, and agree to abide by these Terms & Conditions.
          </div>
          {TERMS.map(t => (
            <div key={t.num} className={styles.term}>
              <div className={styles.termNum}>{t.num}</div>
              <div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </div>
          ))}
          <div className={styles.contact}>
            If you have any questions or concerns, please <a href="mailto:contact@cushionguru.com" target="_blank" rel="noopener noreferrer">contact our customer service team</a>.
          </div>
        </div>
      </section>
    </>
  );
}
