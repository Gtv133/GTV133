import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale } from '../stores/saleStore';
import { BusinessInfo, ReceiptSettings } from '../stores/settingStore';
import { printerPlugin } from './printerPlugin';

let ticketCounter = parseInt(localStorage.getItem('ticketCounter') || '1', 10);

interface PaymentInfo {
  cashReceived?: number;
  change?: number;
}

export async function generateReceipt(
  sale: Sale,
  businessInfo: BusinessInfo,
  receiptSettings: ReceiptSettings,
  paymentInfo?: PaymentInfo
) {
  const printer = printerPlugin.getSelectedPrinter();
  const paperWidth = printer?.width || 80;
  const contentWidth = paperWidth - 10; // Account for margins
  
  let content = `<div style="font-family: 'Courier New', monospace; width: ${paperWidth}mm; padding: 5mm;">`;

  // Business info and logo
  if (receiptSettings.printHeader) {
    if (receiptSettings.showLogo && businessInfo.logoUrl) {
      content += `
        <div style="text-align: center; margin-bottom: 10px;">
          <img src="${businessInfo.logoUrl}" style="max-width: ${contentWidth}mm; max-height: 60px;">
        </div>
      `;
    }
    
    content += `
      <div style="text-align: center; font-size: ${receiptSettings.fontSize}pt; margin-bottom: 10px;">
        <strong>${businessInfo.name}</strong><br>
        ${businessInfo.address ? `${businessInfo.address}<br>` : ''}
        ${businessInfo.phone ? `Tel: ${businessInfo.phone}<br>` : ''}
        ${businessInfo.taxId ? `RFC: ${businessInfo.taxId}<br>` : ''}
      </div>
    `;
  }

  // Sale info
  content += `
    <div style="text-align: center; margin-bottom: 10px;">
      Fecha: ${format(new Date(sale.createdAt), 'PPpp', { locale: es })}<br>
      Ticket #: ${ticketCounter}
    </div>
  `;

  // Items table header
  content += `
    <div style="margin-bottom: 10px;">
      <div style="border-bottom: 1px dashed #000; margin-bottom: 5px;">
        <pre style="margin: 0; font-family: 'Courier New', monospace;">
Producto          Cant    Precio   Total</pre>
      </div>
  `;

  // Items with fixed-width columns
  for (const item of sale.items) {
    const name = item.product.name.padEnd(16).slice(0, 16);
    const quantity = item.quantity.toString().padStart(4);
    const price = item.price.toFixed(2).padStart(8);
    const total = item.total.toFixed(2).padStart(8);
    
    content += `<pre style="margin: 0; font-family: 'Courier New', monospace;">${name} ${quantity} ${price} ${total}</pre>`;
  }

  content += '<div style="border-bottom: 1px dashed #000; margin: 5px 0;"></div>';

  // Totals section with right alignment and proper spacing
  content += '<div style="text-align: right;">';
  
  // Each total on its own line with proper pre tag
  content += `<pre style="margin: 0; font-family: 'Courier New', monospace;">Subtotal:${sale.subtotal.toFixed(2).padStart(29)}</pre>`;
  
  if (receiptSettings.enableTax) {
    content += `<pre style="margin: 0; font-family: 'Courier New', monospace;">IVA:${sale.tax.toFixed(2).padStart(33)}</pre>`;
  }

  if (sale.discount && sale.discount > 0) {
    content += `<pre style="margin: 0; font-family: 'Courier New', monospace;">Descuento:${sale.discount.toFixed(2).padStart(27)}</pre>`;
  }

  content += `<pre style="margin: 0; font-family: 'Courier New', monospace;">Total:${sale.total.toFixed(2).padStart(31)}</pre>`;
  content += '</div>';

  // Payment info with proper spacing
  content += `
    <div style="margin-top: 10px;">
      <pre style="margin: 0; font-family: 'Courier New', monospace;">
Método de pago: ${sale.paymentMethod}</pre>`;

  if (sale.paymentMethod === 'efectivo' && paymentInfo) {
    content += `<pre style="margin: 0; font-family: 'Courier New', monospace;">
Efectivo:${paymentInfo.cashReceived?.toFixed(2).padStart(28)}</pre>
<pre style="margin: 0; font-family: 'Courier New', monospace;">
Cambio:${paymentInfo.change?.toFixed(2).padStart(30)}</pre>`;
  }

  content += '</div>';

  // Footer
  if (receiptSettings.printFooter && receiptSettings.footerMessage) {
    content += `
      <div style="text-align: center; margin-top: 10px; padding: 5px 0; border-top: 1px dashed #000;">
        ${receiptSettings.footerMessage}
      </div>
    `;
  }

  // QR Code
  if (receiptSettings.printQr) {
    try {
      const qrData = `${businessInfo.name}\nTicket: ${ticketCounter}\nTotal: $${sale.total.toFixed(2)}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: Math.min(contentWidth - 20, 100),
        margin: 1,
      });
      
      content += `
        <div style="text-align: center; margin-top: 10px;">
          <img src="${qrDataUrl}" style="width: ${Math.min(contentWidth - 20, 100)}px;">
        </div>
      `;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  content += '</div>';

  // Print using selected printer
  const success = await printerPlugin.print(content);

  if (!success) {
    throw new Error('Error al imprimir el ticket');
  }

  // Increment and save ticket counter
  ticketCounter++;
  localStorage.setItem('ticketCounter', ticketCounter.toString());

  return true;
}

export function initializeTicketCounter() {
  const savedCounter = localStorage.getItem('ticketCounter');
  if (!savedCounter) {
    localStorage.setItem('ticketCounter', '1');
    ticketCounter = 1;
  } else {
    ticketCounter = parseInt(savedCounter, 10);
  }
}

initializeTicketCounter();