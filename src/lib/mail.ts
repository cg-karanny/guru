import nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

// Ensure you have configured AWS credentials in your environment variables:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
// AWS_REGION
// EMAIL_FROM (e.g., "no-reply@yourdomain.com")

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
} as any);

const FROM_EMAIL = process.env.EMAIL_FROM || 'contact@cushionguru.com';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  bcc?: string;
}

export async function sendMail({ to, subject, html, bcc }: SendMailOptions) {
  try {
    // Explicitly configure SES Destination to ensure BCC is handled correctly by AWS SESv2
    const sesOverrides: any = {};
    if (bcc) {
      sesOverrides.Destination = {
        ToAddresses: Array.isArray(to) ? to : to.split(',').map(e => e.trim()),
        BccAddresses: Array.isArray(bcc) ? bcc : bcc.split(',').map(e => e.trim()),
      };
    }

    const info: any = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      bcc,
      ses: sesOverrides,
    } as any);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
