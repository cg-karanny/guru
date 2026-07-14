import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getOrderedCustomOptions } from './format-options';

const fetchImageAsBase64 = async (url: string) => {
  try {
    let proxyUrl = url;
    if (!url.startsWith('data:')) {
      proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Proxy fetch failed: ${response.statusText}`);
      const data = await response.json();
      proxyUrl = data.dataUrl;
    }

    if (typeof document !== 'undefined') {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 1.0));
          } else {
            resolve(proxyUrl);
          }
        };
        img.onerror = () => resolve(proxyUrl);
        img.src = proxyUrl;
      });
    }
    return proxyUrl;
  } catch (e) {
    console.warn("Failed to fetch image", e);
    return null;
  }
};

export const downloadInvoice = async (order: any, logoUrl?: string, brandName?: string) => {
  const doc = new jsPDF();

  // Try fetching logo, using passed logoUrl if available
  let logoBase64: string | null = null;
  try {
    const finalLogoUrl = logoUrl?.trim();
    if (finalLogoUrl) {
      const resolvedUrl = finalLogoUrl.startsWith('data:')
        ? finalLogoUrl
        : (typeof window !== 'undefined' ? new URL(finalLogoUrl, window.location.origin).href : finalLogoUrl);
      logoBase64 = await fetchImageAsBase64(resolvedUrl);
    } else {
      const setRes = await fetch(typeof window !== 'undefined' ? window.location.origin + '/api/settings' : '/api/settings');
      if (setRes.ok) {
        const settings = await setRes.json();
        const settingsLogo = settings.logoUrl || settings.siteLogo || '';
        if (settingsLogo) {
          const resolvedUrl = settingsLogo.startsWith('data:')
            ? settingsLogo
            : (typeof window !== 'undefined' ? new URL(settingsLogo, window.location.origin).href : settingsLogo);
          logoBase64 = await fetchImageAsBase64(resolvedUrl);
        }
      }
    }
  } catch (e) {
    console.warn('Invoice logo fetch failed:', e);
  }

  // Header Logo
  const LOGO_X = 14;
  const LOGO_Y = 10;
  const MAX_WIDTH = 40;   // 🔁 change this to control size
  const MAX_HEIGHT = 30;  // 🔁 change this to control size

  if (logoBase64) {
    try {
      let type = 'JPEG';
      const urlStr = (logoUrl || '').toLowerCase();
      if (logoBase64.startsWith('data:image/png') || urlStr.includes('.png')) type = 'PNG';
      else if (logoBase64.startsWith('data:image/webp') || urlStr.includes('.webp')) type = 'WEBP';

      // Get original image dimensions
      const imgProps = doc.getImageProperties(logoBase64);

      let width = MAX_WIDTH;
      let height = (imgProps.height * width) / imgProps.width;

      // If height exceeds max, scale down
      if (height > MAX_HEIGHT) {
        height = MAX_HEIGHT;
        width = (imgProps.width * height) / imgProps.height;
      }

      // Ensure white background for transparent logos
      doc.setFillColor(255, 255, 255);
      doc.rect(LOGO_X, LOGO_Y, width, height, 'F');

      doc.addImage(logoBase64, type, LOGO_X, LOGO_Y, width, height);

    } catch (err) {
      // Fallback to text
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text(brandName || 'Cushion Guru', LOGO_X, LOGO_Y + 15);
    }
  } else {
    // No logo → show brand name
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(brandName || 'Cushion Guru', LOGO_X, LOGO_Y + 15);
  }

  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text('TAX INVOICE', 140, 25);

  const startY = 50;

  // 3 Columns: Order Info | Bill To | Ship To
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  // Column 1: Order Details
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', 14, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${order.id.slice(-8).toUpperCase()}`, 14, startY + 6);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, startY + 12);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, startY + 18);
  doc.text(`Payment: ${order.paymentMethod || 'COD'}`, 14, startY + 24);
  let paymentStatus = 'Pending';
  if (order.status === 'CANCELLED') paymentStatus = 'Cancelled';
  else if (order.paymentMethod === 'STRIPE') paymentStatus = 'Paid';
  else if (order.status === 'DELIVERED') paymentStatus = 'Paid';
  doc.text(`Payment Status: ${paymentStatus}`, 14, startY + 30);

  // Address Parsers
  const rawShip = order.shippingAddr?.shipping || order.shippingAddr || {};
  const rawBill = order.shippingAddr?.billing || rawShip;

  const formatAddr = (addr: any) => {
    return [
      addr.fullName || order.user?.name || 'Customer',
      addr.address || '-',
      `${addr.city || ''}${addr.state ? ', ' + addr.state : ''} ${addr.zip || ''}`,
      addr.country || '',
      addr.phone ? `Phone: ${addr.phone}` : ''
    ].filter(Boolean);
  }

  const billLines = formatAddr(rawBill);
  const shipLines = formatAddr(rawShip);

  // Compare safely excluding methods, etc.
  const isSame = JSON.stringify(rawBill) === JSON.stringify(rawShip);

  // Column 2: Bill To
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 80, startY);
  doc.setFont('helvetica', 'normal');
  billLines.forEach((line, i) => doc.text(line, 80, startY + 6 + (i * 6)));

  // Column 3: Ship To
  doc.setFont('helvetica', 'bold');
  doc.text('Ship To:', 140, startY);
  doc.setFont('helvetica', 'normal');
  if (isSame) {
    doc.text('Same as billing address', 140, startY + 6);
  } else {
    shipLines.forEach((line, i) => doc.text(line, 140, startY + 6 + (i * 6)));
  }

  const tableStartY = startY + 45;

  // Items
  const itemsArray = Array.isArray(order.items) ? order.items : [];

  const tableData = itemsArray.map((item: any) => {
    let description = item.name;
    if (item.customOptions && Object.keys(item.customOptions).length > 0) {
      const options = getOrderedCustomOptions(item.customOptions);
      const optionsStr = options.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join(' | ');
      description += `\n\nDetails: ${optionsStr}`;
    } else if (item.category) {
      description += `\n\nCategory: ${item.category}`;
    }

    return [
      description,
      item.quantity.toString(),
      `$${Number(item.price || 0).toFixed(2)}`,
      `$${(Number(item.price || 0) * Number(item.quantity)).toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['Item Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 20;

  const subtotal = itemsArray.reduce((acc: number, val: any) => acc + (Number(val.price || 0) * Number(val.quantity)), 0);
  const delivery = order.deliveryCharge || 0;
  const total = order.total || (subtotal + delivery);

  // Total Amount at Left
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('TOTAL AMOUNT:', 14, finalY + 15);
  doc.setFontSize(16);
  doc.text(`$${total.toFixed(2)}`, 14, finalY + 23);

  // Subtotal and Delivery on Right
  let currentY = finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 130, currentY);
  doc.text(`$${subtotal.toFixed(2)}`, 195, currentY, { align: 'right' });
  currentY += 6;

  if (delivery > 0) {
    doc.text('Delivery Charge:', 130, currentY);
    doc.text(`$${delivery.toFixed(2)}`, 195, currentY, { align: 'right' });
    currentY += 6;
  }

  const calculatedTotal = subtotal + delivery;
  const discount = calculatedTotal - total;

  if (discount > 0.01) {
    doc.setTextColor(46, 139, 87); // Green color for discount

    // Extract promo code if available
    let label = 'Discount Applied:';
    if (order.notes && order.notes.includes('Promo Code Applied')) {
      const match = order.notes.match(/\(([^)]+)\)/); // Match the coupon name in parens from notes
      if (match && match[1] && !match[1].startsWith('Stripe Discount')) {
        label = `Discount (${match[1]}):`;
      }
    }

    doc.text(label, 130, currentY);
    doc.text(`-$${discount.toFixed(2)}`, 195, currentY, { align: 'right' });
    doc.setTextColor(100, 100, 100); // Reset color
    currentY += 6;
  }

  // Thank You
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text('Thank you for shopping with Cushion Guru!', 14, finalY + 45);
  doc.text('For any questions or support, please contact us.', 14, finalY + 50);

  doc.save(`Invoice_${order.id}.pdf`);
};

export const downloadOrderDetails = async (order: any, logoUrl?: string, brandName?: string) => {
  const doc = new jsPDF();

  let logoBase64: string | null = null;
  try {
    const finalLogoUrl = logoUrl?.trim();
    if (finalLogoUrl) {
      const resolvedUrl = finalLogoUrl.startsWith('data:')
        ? finalLogoUrl
        : (typeof window !== 'undefined' ? new URL(finalLogoUrl, window.location.origin).href : finalLogoUrl);
      logoBase64 = await fetchImageAsBase64(resolvedUrl);
    } else {
      const setRes = await fetch(typeof window !== 'undefined' ? window.location.origin + '/api/settings' : '/api/settings');
      if (setRes.ok) {
        const settings = await setRes.json();
        const settingsLogo = settings.logoUrl || settings.siteLogo || '';
        if (settingsLogo) {
          const resolvedUrl = settingsLogo.startsWith('data:')
            ? settingsLogo
            : (typeof window !== 'undefined' ? new URL(settingsLogo, window.location.origin).href : settingsLogo);
          logoBase64 = await fetchImageAsBase64(resolvedUrl);
        }
      }
    }
  } catch (e) {
    console.warn('Invoice logo fetch failed:', e);
  }

  const LOGO_X = 14;
  const LOGO_Y = 10;
  const MAX_WIDTH = 40;
  const MAX_HEIGHT = 30;

  if (logoBase64) {
    try {
      let type = 'JPEG';
      const urlStr = (logoUrl || '').toLowerCase();
      if (logoBase64.startsWith('data:image/png') || urlStr.includes('.png')) type = 'PNG';
      else if (logoBase64.startsWith('data:image/webp') || urlStr.includes('.webp')) type = 'WEBP';

      const imgProps = doc.getImageProperties(logoBase64);
      let width = MAX_WIDTH;
      let height = (imgProps.height * width) / imgProps.width;

      if (height > MAX_HEIGHT) {
        height = MAX_HEIGHT;
        width = (imgProps.width * height) / imgProps.height;
      }

      doc.setFillColor(255, 255, 255);
      doc.rect(LOGO_X, LOGO_Y, width, height, 'F');
      doc.addImage(logoBase64, type, LOGO_X, LOGO_Y, width, height);

    } catch (err) {
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text(brandName || 'Cushion Guru', LOGO_X, LOGO_Y + 15);
    }
  } else {
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(brandName || 'Cushion Guru', LOGO_X, LOGO_Y + 15);
  }

  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text('ORDER DETAILS', 125, 25);

  let currentY = 50;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order ID: ${order.id.slice(-8).toUpperCase()}`, 14, currentY);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, currentY + 6);

  // const rawShip = order.shippingAddr?.shipping || order.shippingAddr || {};
  // const shipLines = [
  //   rawShip.fullName || order.user?.name || 'Customer',
  //   rawShip.address || '-',
  //   `${rawShip.city || ''}${rawShip.state ? ', ' + rawShip.state : ''} ${rawShip.zip || ''}`,
  //   rawShip.country || '',
  //   rawShip.phone ? `Phone: ${rawShip.phone}` : ''
  // ].filter(Boolean);

  // doc.text('Shipping Address:', 100, currentY);
  // doc.setFont('helvetica', 'normal');
  // shipLines.forEach((line, i) => doc.text(line, 100, currentY + 6 + (i * 6)));

  // currentY += Math.max(20, shipLines.length * 6 + 10);
  currentY += 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Items Ordered:', 14, currentY);
  currentY += 10;

  const itemsArray = Array.isArray(order.items) ? order.items : [];

  for (let i = 0; i < itemsArray.length; i++) {
    const item = itemsArray[i];

    if (currentY > 250) { doc.addPage(); currentY = 20; }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${item.name} (Qty: ${item.quantity})`, 14, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    if (item.customOptions && Object.keys(item.customOptions).length > 0) {
      const options = getOrderedCustomOptions(item.customOptions);
      for (const [k, v] of options) {
        doc.text(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`, 14, currentY);
        currentY += 5;
        if (currentY > 270) { doc.addPage(); currentY = 20; }
      }
    } else {
      doc.text(`Category: ${item.category || 'Standard'}`, 14, currentY);
      currentY += 5;
    }

    currentY += 5;

    if (item.image) {
      const imgBase64 = await fetchImageAsBase64(item.image);
      if (imgBase64) {
        if (currentY > 180) { doc.addPage(); currentY = 20; }
        try {
          const imgProps = doc.getImageProperties(imgBase64);
          const maxImgWidth = 140;
          const maxImgHeight = 100;
          let w = maxImgWidth;
          let h = (imgProps.height * w) / imgProps.width;
          if (h > maxImgHeight) {
            h = maxImgHeight;
            w = (imgProps.width * h) / imgProps.height;
          }

          let type = 'JPEG';
          const urlStr = item.image.toLowerCase();
          if (imgBase64.startsWith('data:image/png') || urlStr.includes('.png')) type = 'PNG';
          else if (imgBase64.startsWith('data:image/webp') || urlStr.includes('.webp')) type = 'WEBP';

          doc.addImage(imgBase64, type, 14, currentY, w, h);
          currentY += h + 10;
        } catch (e) {
          console.warn("Failed to add item image", e);
        }
      }
    }

    currentY += 5;
    if (i < itemsArray.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(14, currentY, 196, currentY);
      currentY += 10;
    }
  }

  doc.save(`OrderDetails_${order.id.slice(-8).toUpperCase()}.pdf`);
};