import { getOrderedCustomOptions } from './format-options';

export function generateOrderConfirmationEmail(order: any, brandName: string, brandLogoUrl?: string, customerName: string = 'Valued Customer', originUrl?: string) {
  const siteUrl = originUrl || (process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : 'http://localhost:3000');
  const logoUrl = 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/CG+Logo-email.jpg';

  console.log('--- DEBUG EMAIL TEMPLATE ---');
  console.log('Input brandLogoUrl:', brandLogoUrl);
  console.log('Derived siteUrl:', siteUrl);
  console.log('Final injected logoUrl:', logoUrl);
  console.log('----------------------------');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff;">
      ${logoUrl ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${logoUrl}" alt="${brandName}" style="max-height: 50px; background-color: transparent;"></div>` : `<h2 style="text-align: center;">${brandName}</h2>`}
      
      <h3 style="color: #4CAF50;">Order Confirmation</h3>
      <p>Dear ${customerName},</p>
      <p>Thank you for your order!</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p><strong>Order ID:</strong> ${order.id.slice(-8).toUpperCase()}</p>
        ${(() => {
      const subtotal = (order.items as any[])?.reduce((acc: number, val: any) => acc + (val.price * val.quantity), 0) || 0;
      const calculatedTotal = subtotal + (order.deliveryCharge || 0);
      const discount = calculatedTotal - order.total;
      if (discount > 0.01) {
        let label = 'Discount Applied';
        if (order.notes && order.notes.includes('Promo Code Applied')) {
          const match = order.notes.match(/\(([^)]+)\)/);
          if (match && match[1] && !match[1].startsWith('Stripe Discount')) {
            label = `Discount (${match[1]})`;
          }
        }
        return `<p style="color: #4CAF50;"><strong>${label}:</strong> -$${discount.toFixed(2)}</p>`;
      }
      return '';
    })()}
        <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <h4 style="margin-top: 30px;">Order Details</h4>
      
      ${order.items && Array.isArray(order.items) ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="background: #eee;">
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
          <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
        </tr>
        ${order.items.map((item: any) => {
      const itemImgUrl = item.image ? (item.image.startsWith('http') ? item.image : `${siteUrl}/${item.image.replace(/^\//, '')}`) : '';
      const customDetails = item.customOptions ? getOrderedCustomOptions(item.customOptions)
        .map(([k, v]) => `<strong>${k.charAt(0).toUpperCase() + k.slice(1)}:</strong> ${v}`)
        .join('<br/>') : '';

      return `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <table style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td style="width: 70px; padding-right: 15px; vertical-align: top;">
                     ${itemImgUrl ? `<img src="${itemImgUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; background: #eee; display: block;" />` : `<div style="width: 60px; height: 60px; background: #eee; border-radius: 6px; text-align: center; line-height: 60px; font-size: 24px;">${item.category === 'Non-Customizable' ? '🛍️' : '🛋️'}</div>`}
                  </td>
                  <td style="vertical-align: top;">
                     <div style="font-weight: bold; font-size: 16px; color: #333;">${item.name || 'Product'}</div>
                     <div style="font-size: 12px; color: #777; text-transform: uppercase; margin-bottom: 4px;">${item.category === 'Non-Customizable' ? 'Ready-made Product' : 'Custom Cushion'}</div>
                     ${item.customOptions && customDetails ? `<div style="font-size: 13px; color: #555; background: #f9f9f9; padding: 6px; border-radius: 4px; margin-top: 5px; line-height: 1.4;">${customDetails}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd; vertical-align: top; font-weight: bold;">${item.quantity || 1}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd; vertical-align: top; font-weight: bold;">$${(item.price * (item.quantity || 1)).toFixed(2)}</td>
          </tr>`;
    }).join('')}
      </table>
      ` : '<p>Custom order details included.</p>'}

      <p style="margin-top: 30px; font-size: 14px; color: #777;">
        If you have any questions, feel free to reply to this email.
      </p>
    </div>
  `;
}

export function generateOtpEmail(otp: string, type: 'REGISTER' | 'FORGOT_PASSWORD' | 'CHANGE_PASSWORD', brandName: string, brandLogoUrl?: string) {
  let actionText = '';
  switch (type) {
    case 'REGISTER': actionText = 'registering your account'; break;
    case 'FORGOT_PASSWORD': actionText = 'resetting your password'; break;
    case 'CHANGE_PASSWORD': actionText = 'changing your password'; break;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : 'http://localhost:3000';
  const logoUrl = 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/CG+Logo-email.jpg';

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; color: #333; text-align: center; background-color: #ffffff;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="max-height: 50px; margin-bottom: 20px; background-color: transparent;">` : `<h2>${brandName}</h2>`}
      
      <h3>Verification Code</h3>
      <p>Here is your one-time password (OTP) for ${actionText}.</p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
      </div>
      
      <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
}

export function generatePasswordChangeEmail(brandName: string, brandLogoUrl?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : 'http://localhost:3000';
  const logoUrl = 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/CG+Logo-email.jpg';

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; color: #333; text-align: center; background-color: #ffffff;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="max-height: 50px; margin-bottom: 20px; background-color: transparent;">` : `<h2>${brandName}</h2>`}
      
      <h3 style="color: #4CAF50;">Password Changed Successfully</h3>
      <p>Your account password has been updated.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #777;">
        If you did not make this change, please contact support immediately.
      </p>
    </div>
  `;
}

export function generateEmailVerificationOtpEmail(otp: string, actionText: string, brandName: string, brandLogoUrl?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : 'http://localhost:3000';
  const logoUrl = 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/CG+Logo-email.jpg';

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; color: #333; text-align: center; background-color: #ffffff;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="max-height: 50px; margin-bottom: 20px; background-color: transparent;">` : `<h2>${brandName}</h2>`}
      
      <h3>Email Verification</h3>
      <p>Here is your one-time password (OTP) for ${actionText}.</p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
      </div>
      
      <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
}

export function generatePaymentFailedEmail(order: any, brandName: string, brandLogoUrl?: string, customerName: string = 'Valued Customer', originUrl?: string) {
  const siteUrl = originUrl || (process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : 'http://localhost:3000');
  const logoUrl = 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/CG+Logo-email.jpg';

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff;">
      ${logoUrl ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${logoUrl}" alt="${brandName}" style="max-height: 50px; background-color: transparent;"></div>` : `<h2 style="text-align: center;">${brandName}</h2>`}
      
      <h3 style="color: #f44336;">Payment Failed</h3>
      <p>Dear ${customerName},</p>
      <p>Unfortunately, your recent payment attempt for your order has failed or was canceled.</p>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total Amount Attempted:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <p style="margin-top: 20px;">
        Don't worry, no charges were successfully completed. Please return to your cart and try again using a different payment method if needed.
      </p>

      <p style="margin-top: 30px; font-size: 14px; color: #777;">
        If you have any questions or need assistance, feel free to reply to this email.
      </p>
    </div>
  `;
}

export function generateWelcomeEmail(brandName: string) {
  const logoUrl = 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/CG+Logo-email.jpg';

  return `
    <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff; border: 1px solid #eee; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${logoUrl}" alt="${brandName}" style="max-height: 60px; background-color: transparent;" />
      </div>
      
      <h2 style="color: #2c3e50; text-align: center;">Welcome to ${brandName}!</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        We are so glad you decided to join our community. Thank you for subscribing, and we look forward to sharing our passion for beautiful, comfortable spaces with you.
      </p>

      <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
        Stay inspired,<br />
        <strong>The ${brandName} Team</strong>
      </p>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
        <p>You are receiving this email because you opted in via our website.</p>
      </div>
    </div>
  `;
}
