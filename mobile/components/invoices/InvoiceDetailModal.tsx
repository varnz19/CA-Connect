import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Invoice } from '../../types';
import { AppBadge } from '../common/AppBadge';
import { AppButton } from '../common/AppButton';
import { formatCurrency, formatDate, numberToIndianWords } from '../../utils/formatters';
import { invoiceService } from '../../services/invoiceService';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  visible: boolean;
  onClose: () => void;
  onMarkPaid?: (id: string) => void;
  isAdmin?: boolean;
  isProcessing?: boolean;
}

// Generate an SVG QR matrix for offline visual rendering
const generateQrSvg = (size = 80) => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="white"/>
  <!-- Position Detection Patterns Top-Left -->
  <rect x="10" y="10" width="28" height="28" fill="black"/>
  <rect x="14" y="14" width="20" height="20" fill="white"/>
  <rect x="18" y="18" width="12" height="12" fill="black"/>
  <!-- Position Detection Patterns Top-Right -->
  <rect x="62" y="10" width="28" height="28" fill="black"/>
  <rect x="66" y="14" width="20" height="20" fill="white"/>
  <rect x="70" y="18" width="12" height="12" fill="black"/>
  <!-- Position Detection Patterns Bottom-Left -->
  <rect x="10" y="62" width="28" height="28" fill="black"/>
  <rect x="14" y="66" width="20" height="20" fill="white"/>
  <rect x="18" y="70" width="12" height="12" fill="black"/>
  <!-- Data modules -->
  <rect x="42" y="12" width="5" height="5" fill="black"/>
  <rect x="52" y="12" width="5" height="5" fill="black"/>
  <rect x="46" y="20" width="6" height="6" fill="black"/>
  <rect x="42" y="28" width="5" height="5" fill="black"/>
  <rect x="52" y="28" width="5" height="5" fill="black"/>
  <rect x="12" y="44" width="5" height="5" fill="black"/>
  <rect x="22" y="44" width="5" height="5" fill="black"/>
  <rect x="32" y="44" width="6" height="6" fill="black"/>
  <rect x="42" y="42" width="8" height="8" fill="black"/>
  <rect x="54" y="44" width="6" height="6" fill="black"/>
  <rect x="64" y="44" width="5" height="5" fill="black"/>
  <rect x="74" y="44" width="5" height="5" fill="black"/>
  <rect x="84" y="44" width="5" height="5" fill="black"/>
  <rect x="14" y="52" width="6" height="6" fill="black"/>
  <rect x="26" y="52" width="6" height="6" fill="black"/>
  <rect x="44" y="54" width="6" height="6" fill="black"/>
  <rect x="62" y="52" width="8" height="6" fill="black"/>
  <rect x="76" y="52" width="6" height="6" fill="black"/>
  <rect x="42" y="66" width="6" height="6" fill="black"/>
  <rect x="52" y="66" width="6" height="6" fill="black"/>
  <rect x="64" y="64" width="6" height="6" fill="black"/>
  <rect x="76" y="64" width="8" height="8" fill="black"/>
  <rect x="44" y="78" width="6" height="6" fill="black"/>
  <rect x="54" y="78" width="6" height="6" fill="black"/>
  <rect x="66" y="78" width="6" height="6" fill="black"/>
  <rect x="76" y="82" width="6" height="6" fill="black"/>
  <rect x="86" y="74" width="6" height="6" fill="black"/>
  <rect x="86" y="86" width="6" height="6" fill="black"/>
</svg>
`;

export const buildInvoiceHtml = (invoice: Invoice) => {
  const client = invoice.client || invoice.clientProfile?.user;
  const profile = invoice.clientProfile;
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      description: 'Statutory Audit & Professional Tax Compliance',
      quantity: 1,
      unitPrice: invoice.subtotal || 5000,
      amount: invoice.subtotal || 5000,
    }
  ];

  const subtotal = invoice.subtotal || items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const taxRate = invoice.taxRate || 18;
  const halfTaxRate = taxRate / 2;
  const cgst = invoice.cgst || (subtotal * halfTaxRate) / 100;
  const sgst = invoice.sgst || (subtotal * halfTaxRate) / 100;
  const totalTax = cgst + sgst;
  const total = invoice.total || (subtotal + totalTax);

  const clientName = profile?.firmName || (client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : 'Client Account');
  const clientGstin = profile?.gstin || '-';
  const clientPan = profile?.panNumber || '-';
  const clientPhone = client?.phone || '-';
  const clientEmail = client?.email || '-';
  const clientAddress = profile?.address || 'Address not specified';
  const clientState = profile?.gstState || '-';

  const issueDateFormatted = formatDate(invoice.issueDate || new Date().toISOString());
  const dueDateFormatted = formatDate(invoice.dueDate || new Date().toISOString());
  const wordsAmount = numberToIndianWords(total);
  const isPaid = invoice.status === 'PAID';

  const qrSvg = generateQrSvg(75);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Tax Invoice ${invoice.invoiceNumber}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #000000;
        background: #FFFFFF;
        padding: 24px;
        font-size: 11px;
      }
      .page-container {
        width: 100%;
        max-width: 820px;
        margin: 0 auto;
        border: 1.5px solid #000000;
      }
      .header-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        border-bottom: 1.5px solid #000000;
        font-size: 11px;
        font-weight: bold;
      }
      .header-strip .title {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      .firm-block {
        display: flex;
        border-bottom: 1.5px solid #000000;
      }
      .logo-cell {
        width: 90px;
        min-width: 90px;
        border-right: 1.5px solid #000000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
        text-align: center;
      }
      .logo-box {
        width: 65px;
        height: 65px;
        border: 1.5px solid #666666;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: #333333;
        text-align: center;
        line-height: 1.2;
      }
      .firm-details {
        flex: 1;
        text-align: center;
        padding: 8px 12px;
      }
      .firm-name {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }
      .firm-address {
        font-size: 11px;
        margin-bottom: 2px;
      }
      .firm-contact {
        font-size: 11px;
        margin-bottom: 2px;
      }
      .firm-tax {
        font-size: 11px;
        font-weight: bold;
      }
      .two-col-table {
        display: flex;
        border-bottom: 1.5px solid #000000;
      }
      .half-col {
        width: 50%;
        padding: 6px 10px;
        font-size: 11px;
        line-height: 1.45;
      }
      .half-col.bordered-right {
        border-right: 1.5px solid #000000;
      }
      .info-row {
        display: flex;
        margin-bottom: 2px;
      }
      .info-row .lbl {
        width: 140px;
        color: #111111;
      }
      .info-row .val {
        flex: 1;
        font-weight: 600;
      }
      .sec-title {
        font-weight: bold;
        font-size: 11px;
        margin-bottom: 3px;
        text-decoration: underline;
      }
      .ref-bar {
        padding: 4px 10px;
        border-bottom: 1.5px solid #000000;
        font-size: 10.5px;
        background: #FFFFFF;
      }
      table.item-grid {
        width: 100%;
        border-collapse: collapse;
      }
      table.item-grid th {
        border-bottom: 1.5px solid #000000;
        border-right: 1px solid #000000;
        padding: 5px 6px;
        font-size: 10.5px;
        font-weight: bold;
        text-align: left;
        background: #FFFFFF;
      }
      table.item-grid th:last-child {
        border-right: none;
      }
      table.item-grid td {
        border-right: 1px solid #000000;
        padding: 5px 6px;
        font-size: 10.5px;
        vertical-align: top;
      }
      table.item-grid td:last-child {
        border-right: none;
      }
      .col-sr { width: 35px; text-align: center; }
      .col-desc { text-align: left; }
      .col-sac { width: 65px; text-align: center; }
      .col-qty { width: 45px; text-align: right; }
      .col-unit { width: 45px; text-align: center; }
      .col-rate { width: 75px; text-align: right; }
      .col-disc { width: 55px; text-align: right; }
      .col-tax { width: 55px; text-align: right; }
      .col-amt { width: 85px; text-align: right; }

      .table-summary-row {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
        display: flex;
        justify-content: space-between;
        padding: 4px 10px;
        font-size: 11px;
      }
      .table-total-row {
        border-bottom: 1.5px solid #000000;
        display: flex;
        justify-content: space-between;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: bold;
      }
      .words-line {
        padding: 5px 10px;
        border-bottom: 1.5px solid #000000;
        font-size: 11px;
        font-weight: bold;
      }
      .settle-tax-line {
        padding: 4px 10px;
        border-bottom: 1.5px solid #000000;
        font-size: 10px;
        line-height: 1.4;
      }
      .bottom-quad-grid {
        display: flex;
        min-height: 155px;
      }
      .bottom-quad-col {
        padding: 6px 8px;
        border-right: 1.5px solid #000000;
        font-size: 9.5px;
        line-height: 1.35;
      }
      .bottom-quad-col:last-child {
        border-right: none;
      }
      .col-terms {
        width: 28%;
      }
      .col-bank {
        width: 27%;
      }
      .col-einvoice {
        width: 20%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      }
      .col-sign {
        width: 25%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: right;
      }
      .sign-top {
        font-weight: bold;
      }
      .sign-bottom {
        font-weight: bold;
        padding-top: 45px;
        border-top: 1px dotted #888888;
        display: inline-block;
        text-align: center;
        margin-top: 40px;
      }
      .footer-brand {
        text-align: center;
        padding: 6px;
        font-size: 10px;
        color: #2563EB;
      }
    </style>
  </head>
  <body>
    <div class="page-container">
      <!-- 1. Top Header Strip -->
      <div class="header-strip">
        <div>Page No. 1 of 1</div>
        <div class="title">TAX INVOICE</div>
        <div>Original Copy</div>
      </div>

      <!-- 2. Company Info Block -->
      <div class="firm-block">
        <div class="logo-cell">
          <div class="logo-box">
            Add<br/>Logo
          </div>
        </div>
        <div class="firm-details">
          <div class="firm-name">CA CONNECT & ASSOCIATES</div>
          <div class="firm-address">Suite 402, Financial District, Nariman Point, Mumbai - 400021</div>
          <div class="firm-contact">Mobile: +91 9876543210, Email: billing@caconnect.in</div>
          <div class="firm-tax">GSTIN: 27AAAAA1111A1Z1 | PAN: AAAAA1111A</div>
        </div>
      </div>

      <!-- 3. Two-Column Metadata (Invoice vs Transporter) -->
      <div class="two-col-table">
        <div class="half-col bordered-right">
          <div class="info-row"><span class="lbl">Invoice Number:</span><span class="val">${invoice.invoiceNumber}</span></div>
          <div class="info-row"><span class="lbl">Invoice Date:</span><span class="val">${issueDateFormatted}</span></div>
          <div class="info-row"><span class="lbl">Due date:</span><span class="val">${dueDateFormatted}</span></div>
          <div class="info-row"><span class="lbl">Place of Supply:</span><span class="val">${clientState}</span></div>
          <div class="info-row"><span class="lbl">Reverse Charge:</span><span class="val">No</span></div>
          <div class="info-row"><span class="lbl">Optional Field 1:</span><span class="val">-</span></div>
          <div class="info-row"><span class="lbl">Optional Field 2:</span><span class="val">-</span></div>
          <div class="info-row"><span class="lbl">Optional Field 3:</span><span class="val">-</span></div>
        </div>
        <div class="half-col">
          <div class="sec-title" style="text-decoration:none; font-weight:bold; margin-bottom:2px;">Transporter Details:</div>
          <div class="info-row"><span class="lbl">Transporter:</span><span class="val">Direct Transportation / Portal</span></div>
          <div class="info-row"><span class="lbl">Vehicle No:</span><span class="val">MH01CA1234</span></div>
          <div class="info-row"><span class="lbl">Transporter Doc No:</span><span class="val">DOC/CAC/${invoice.invoiceNumber.replace(/[^0-9]/g, '') || '1234'}</span></div>
          <div class="info-row"><span class="lbl">Transporter Doc Date:</span><span class="val">${issueDateFormatted}</span></div>
          <div class="info-row"><span class="lbl">E-Way Bill No:</span><span class="val">271234567890</span></div>
          <div class="info-row"><span class="lbl">E-Way Bill Date:</span><span class="val">${issueDateFormatted}</span></div>
        </div>
      </div>

      <!-- 4. Billing & Shipping Details -->
      <div class="two-col-table">
        <div class="half-col bordered-right">
          <div class="sec-title">Billing Details</div>
          <div class="info-row"><span class="lbl">Name:</span><span class="val">${clientName}</span></div>
          <div class="info-row"><span class="lbl">GSTIN:</span><span class="val">${clientGstin} | Mobile: ${clientPhone}</span></div>
          <div class="info-row"><span class="lbl">Email:</span><span class="val">${clientEmail}</span></div>
          <div class="info-row"><span class="lbl">Add Address:</span><span class="val">${clientAddress}</span></div>
        </div>
        <div class="half-col">
          <div class="sec-title">Shipping Details</div>
          <div class="info-row"><span class="lbl">Name:</span><span class="val">${clientName}</span></div>
          <div class="info-row"><span class="lbl">GSTIN:</span><span class="val">${clientGstin} | Mobile: ${clientPhone}</span></div>
          <div class="info-row"><span class="lbl">Email:</span><span class="val">${clientEmail}</span></div>
          <div class="info-row"><span class="lbl">Add Address:</span><span class="val">${clientAddress}</span></div>
        </div>
      </div>

      <!-- 5. PO & Job Reference Line -->
      <div class="ref-bar">
        <span><strong>PO/Ref No:</strong> PO-CAC-${invoice.invoiceNumber.replace(/[^0-9]/g, '') || '2026'}</span>
        <span>|</span>
        <span><strong>Job No:</strong> CAC/JOB-4820</span>
        <span>|</span>
        <span><strong>Job Date:</strong> ${issueDateFormatted}</span>
      </div>

      <!-- 6. Formal Items Table -->
      <table class="item-grid">
        <thead>
          <tr>
            <th class="col-sr">Sr.</th>
            <th class="col-desc">Item Description</th>
            <th class="col-sac">HSN/SAC</th>
            <th class="col-qty">Qty</th>
            <th class="col-unit">Unit</th>
            <th class="col-rate">List Price</th>
            <th class="col-disc">Disc.</th>
            <th class="col-tax">Tax %</th>
            <th class="col-amt">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item: any, idx: number) => `
            <tr>
              <td class="col-sr">${idx + 1}</td>
              <td class="col-desc">${item.description}</td>
              <td class="col-sac">998221</td>
              <td class="col-qty">${Number(item.quantity).toFixed(1)}</td>
              <td class="col-unit">Nos</td>
              <td class="col-rate">${Number(item.unitPrice).toFixed(2)}</td>
              <td class="col-disc">0.00</td>
              <td class="col-tax">${Number(taxRate).toFixed(2)}</td>
              <td class="col-amt">${Number(item.amount || item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <!-- 7. Table Summary & Total -->
      <div class="table-summary-row">
        <span>Discount:</span>
        <span>0.00</span>
      </div>
      <div class="table-total-row">
        <span>Total</span>
        <span>₹ ${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <!-- 8. Amount in Words -->
      <div class="words-line">
        ${wordsAmount}
      </div>

      <!-- 9. Settlement & Tax Breakdown Strip -->
      <div class="settle-tax-line">
        <div>
          <strong>Settled by - Bank:</strong> ₹ ${isPaid ? Number(total).toFixed(2) : '0.00'} | <strong>Invoice Balance:</strong> ₹ ${isPaid ? '0.00' : Number(total).toFixed(2)}
        </div>
        <div style="margin-top:2px;">
          Tax @${taxRate}% : ₹ ${Number(subtotal).toFixed(2)} | CGST (${halfTaxRate}%): ₹ ${Number(cgst).toFixed(2)} | SGST (${halfTaxRate}%): ₹ ${Number(sgst).toFixed(2)} | Total Tax: ₹ ${Number(totalTax).toFixed(2)} | Add. Cess : 0.00
        </div>
      </div>

      <!-- 10. Bottom 4-Column Box -->
      <div class="bottom-quad-grid">
        <!-- Terms and Conditions -->
        <div class="bottom-quad-col col-terms">
          <div style="font-weight:bold; margin-bottom:3px;">Terms and Conditions:</div>
          <div>1. E.& O.E.</div>
          <div>2. Goods once sold / services rendered will not be taken back.</div>
          <div>3. Interest @ 18% p.a. will be charged if payment is not made within the stipulated time.</div>
          <div>4. Subject to 'Mumbai' jurisdiction only.</div>
        </div>

        <!-- Bank Details with UPI QR -->
        <div class="bottom-quad-col col-bank">
          <div style="display:flex; gap:6px; align-items:flex-start; margin-bottom:4px;">
            <div style="width:55px; height:55px;">${qrSvg}</div>
            <div style="font-size:9px; line-height:1.25;">
              <div><strong>Account Number:</strong><br/>123456789012</div>
              <div><strong>Bank:</strong> HDFC Bank</div>
              <div><strong>IFSC:</strong> HDFC0000123</div>
            </div>
          </div>
          <div style="font-size:9px;">
            <div><strong>Branch:</strong> Nariman Point, Mumbai</div>
            <div><strong>Name:</strong> CA Connect & Associates</div>
          </div>
        </div>

        <!-- E-Invoice QR -->
        <div class="bottom-quad-col col-einvoice">
          <div style="font-weight:bold; margin-bottom:4px;">E-Invoice QR</div>
          <div style="width:65px; height:65px;">${qrSvg}</div>
        </div>

        <!-- Authorized Signature -->
        <div class="bottom-quad-col col-sign">
          <div class="sign-top">For CA Connect & Associates</div>
          <div style="text-align:center;">
            <div style="height:35px;"></div>
            <div style="border-top:1px solid #000000; padding-top:2px; font-size:10px;">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 11. Footer Credit -->
    <div class="footer-brand">
      Invoice Created by <a href="https://www.caconnect.in" style="color:#2563EB; text-decoration:none;">www.caconnect.in</a>
    </div>
  </body>
  </html>
  `;
};

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  visible,
  onClose,
  onMarkPaid,
  isAdmin = false,
  isProcessing = false,
}) => {
  if (!invoice) return null;

  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const client = invoice.client || invoice.clientProfile?.user;
  const profile = invoice.clientProfile;
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      id: 'default-1',
      description: 'Statutory Audit & Professional Tax Compliance',
      quantity: 1,
      unitPrice: invoice.subtotal || 5000,
      amount: invoice.subtotal || 5000,
    }
  ];

  const subtotal = invoice.subtotal || items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const taxRate = invoice.taxRate || 18;
  const halfTaxRate = taxRate / 2;
  const cgst = invoice.cgst || (subtotal * halfTaxRate) / 100;
  const sgst = invoice.sgst || (subtotal * halfTaxRate) / 100;
  const totalTax = cgst + sgst;
  const total = invoice.total || (subtotal + totalTax);

  const clientName = profile?.firmName || (client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : 'Client Account');
  const clientGstin = profile?.gstin || '-';
  const clientPhone = client?.phone || '-';
  const clientEmail = client?.email || '-';
  const clientAddress = profile?.address || 'Address not specified';
  const clientState = profile?.gstState || '-';

  const issueDateFormatted = formatDate(invoice.issueDate || new Date().toISOString());
  const dueDateFormatted = formatDate(invoice.dueDate || new Date().toISOString());
  const wordsAmount = numberToIndianWords(total);
  const isPaid = invoice.status === 'PAID';

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const html = buildInvoiceHtml(invoice);
      await Print.printAsync({ html });
    } catch (err: any) {
      console.error('Print error:', err);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.print();
      } else {
        Alert.alert('Print Error', 'Could not open print dialogue. Please try downloading the PDF instead.');
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const html = buildInvoiceHtml(invoice);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `Tax Invoice ${invoice.invoiceNumber}`,
            text: `Tax Invoice ${invoice.invoiceNumber} from CA Connect & Associates for ${formatCurrency(total)}.`,
            url: uri,
          });
        } else {
          window.open(uri, '_blank');
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Tax Invoice ${invoice.invoiceNumber}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('PDF Ready', `Generated PDF at: ${uri}`);
        }
      }
    } catch (err: any) {
      console.error('Share error:', err);
      Alert.alert('Share Failed', 'Could not share invoice file.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const filename = `Tax-Invoice-${invoice.invoiceNumber.replace(/[\/\\:]/g, '_')}.pdf`;

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        // First try downloading backend-generated official PDF
        try {
          const blob = await invoiceService.downloadPdf(invoice.id);
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
          return;
        } catch (backendErr) {
          console.warn('Backend download fallback to client-side PDF:', backendErr);
        }

        // Web fallback: instant client-side print-to-file PDF
        const html = buildInvoiceHtml(invoice);
        const { uri } = await Print.printToFileAsync({ html });
        const a = document.createElement('a');
        a.href = uri;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Native iOS/Android
        const html = buildInvoiceHtml(invoice);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Download ${filename}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('PDF Saved', `Saved to device at: ${uri}`);
        }
      }
    } catch (err: any) {
      console.error('PDF error:', err);
      Alert.alert('PDF Error', 'Could not download PDF. You can also use the Print button.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Control Bar */}
          <View style={styles.controlHeader}>
            <View style={styles.controlLeft}>
              <Text style={styles.controlRef}>{invoice.invoiceNumber}</Text>
              <AppBadge status={invoice.status} />
            </View>

            {/* Print & Share Actions */}
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={handlePrint}
                disabled={isPrinting}
                activeOpacity={0.7}
              >
                {isPrinting ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="print-outline" size={15} color={Colors.primary} />
                )}
                <Text style={styles.toolBtnText}>Print</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolBtn}
                onPress={handleShare}
                disabled={isSharing}
                activeOpacity={0.7}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <Ionicons name="share-social-outline" size={15} color="#059669" />
                )}
                <Text style={[styles.toolBtnText, { color: '#059669' }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolBtn}
                onPress={handleDownloadPdf}
                disabled={isDownloadingPdf}
                activeOpacity={0.7}
              >
                {isDownloadingPdf ? (
                  <ActivityIndicator size="small" color="#D97706" />
                ) : (
                  <Ionicons name="download-outline" size={15} color="#D97706" />
                )}
                <Text style={[styles.toolBtnText, { color: '#D97706' }]}>PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* The Strict Formal Invoice Document Card matching the user's template */}
            <View style={styles.formalInvoiceSheet}>
              {/* 1. Header Line */}
              <View style={styles.docHeaderStrip}>
                <Text style={styles.docHeaderSmall}>Page No. 1 of 1</Text>
                <Text style={styles.docHeaderTitle}>TAX INVOICE</Text>
                <Text style={styles.docHeaderSmall}>Original Copy</Text>
              </View>

              {/* 2. Firm Header Box */}
              <View style={styles.docFirmBlock}>
                <View style={styles.docLogoBox}>
                  <View style={styles.docLogoSquare}>
                    <Text style={styles.docLogoText}>Add</Text>
                    <Text style={styles.docLogoText}>Logo</Text>
                  </View>
                </View>
                <View style={styles.docFirmInfo}>
                  <Text style={styles.docFirmName}>CA CONNECT & ASSOCIATES</Text>
                  <Text style={styles.docFirmSub}>Suite 402, Financial District, Nariman Point, Mumbai - 400021</Text>
                  <Text style={styles.docFirmSub}>Mobile: +91 9876543210, Email: billing@caconnect.in</Text>
                  <Text style={styles.docFirmTax}>GSTIN: 27AAAAA1111A1Z1 | PAN: AAAAA1111A</Text>
                </View>
              </View>

              {/* 3. Two-Column Metadata (Invoice vs Transporter) */}
              <View style={styles.docTwoCol}>
                <View style={[styles.docHalfCol, styles.docBorderRight]}>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Invoice Number:</Text>
                    <Text style={styles.docMetaVal}>{invoice.invoiceNumber}</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Invoice Date:</Text>
                    <Text style={styles.docMetaVal}>{issueDateFormatted}</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Due date:</Text>
                    <Text style={styles.docMetaVal}>{dueDateFormatted}</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Place of Supply:</Text>
                    <Text style={styles.docMetaVal}>{clientState}</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Reverse Charge:</Text>
                    <Text style={styles.docMetaVal}>No</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Optional Field 1:</Text>
                    <Text style={styles.docMetaVal}>-</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Optional Field 2:</Text>
                    <Text style={styles.docMetaVal}>-</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Optional Field 3:</Text>
                    <Text style={styles.docMetaVal}>-</Text>
                  </View>
                </View>

                <View style={styles.docHalfCol}>
                  <Text style={styles.docColTitle}>Transporter Details:</Text>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Transporter:</Text>
                    <Text style={styles.docMetaVal}>Direct Transportation</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Vehicle No:</Text>
                    <Text style={styles.docMetaVal}>MH01CA1234</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Transporter Doc No:</Text>
                    <Text style={styles.docMetaVal}>DOC/CAC/1234</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>Transporter Doc Date:</Text>
                    <Text style={styles.docMetaVal}>{issueDateFormatted}</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>E-Way Bill No:</Text>
                    <Text style={styles.docMetaVal}>271234567890</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={styles.docMetaLabel}>E-Way Bill Date:</Text>
                    <Text style={styles.docMetaVal}>{issueDateFormatted}</Text>
                  </View>
                </View>
              </View>

              {/* 4. Billing & Shipping Details */}
              <View style={styles.docTwoCol}>
                <View style={[styles.docHalfCol, styles.docBorderRight]}>
                  <Text style={styles.docColUnderline}>Billing Details</Text>
                  <Text style={styles.docMetaBold}>Name: {clientName}</Text>
                  <Text style={styles.docMetaSub}>GSTIN: {clientGstin} | Mobile: {clientPhone}</Text>
                  <Text style={styles.docMetaSub}>Email: {clientEmail}</Text>
                  <Text style={styles.docMetaSub}>Add Address: {clientAddress}</Text>
                </View>

                <View style={styles.docHalfCol}>
                  <Text style={styles.docColUnderline}>Shipping Details</Text>
                  <Text style={styles.docMetaBold}>Name: {clientName}</Text>
                  <Text style={styles.docMetaSub}>GSTIN: {clientGstin} | Mobile: {clientPhone}</Text>
                  <Text style={styles.docMetaSub}>Email: {clientEmail}</Text>
                  <Text style={styles.docMetaSub}>Add Address: {clientAddress}</Text>
                </View>
              </View>

              {/* 5. PO / Job Reference Line */}
              <View style={styles.docRefBar}>
                <Text style={styles.docRefText}>
                  PO/Ref No: PO-CAC-2026  |  Job No: CAC/JOB-4820  |  Job Date: {issueDateFormatted}
                </Text>
              </View>

              {/* 6. Formal Items Table Header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, styles.tSr]}>Sr.</Text>
                <Text style={[styles.thCell, styles.tDesc]}>Item Description</Text>
                <Text style={[styles.thCell, styles.tSac]}>HSN/SAC</Text>
                <Text style={[styles.thCell, styles.tQty]}>Qty</Text>
                <Text style={[styles.thCell, styles.tUnit]}>Unit</Text>
                <Text style={[styles.thCell, styles.tRate]}>List Price</Text>
                <Text style={[styles.thCell, styles.tDisc]}>Disc.</Text>
                <Text style={[styles.thCell, styles.tTax]}>Tax %</Text>
                <Text style={[styles.thCell, styles.tAmt]}>Amount (₹)</Text>
              </View>

              {/* Table Rows */}
              {items.map((item, idx) => (
                <View key={item.id || idx} style={styles.tableDataRow}>
                  <Text style={[styles.tdCell, styles.tSr]}>{idx + 1}</Text>
                  <Text style={[styles.tdCell, styles.tDesc]}>{item.description}</Text>
                  <Text style={[styles.tdCell, styles.tSac]}>998221</Text>
                  <Text style={[styles.tdCell, styles.tQty]}>{Number(item.quantity).toFixed(1)}</Text>
                  <Text style={[styles.tdCell, styles.tUnit]}>Nos</Text>
                  <Text style={[styles.tdCell, styles.tRate]}>{Number(item.unitPrice).toFixed(2)}</Text>
                  <Text style={[styles.tdCell, styles.tDisc]}>0.00</Text>
                  <Text style={[styles.tdCell, styles.tTax]}>{Number(taxRate).toFixed(2)}</Text>
                  <Text style={[styles.tdCell, styles.tAmt]}>
                    {Number(item.amount || item.quantity * item.unitPrice).toFixed(2)}
                  </Text>
                </View>
              ))}

              {/* Table Summary */}
              <View style={styles.summaryBar}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={styles.summaryVal}>0.00</Text>
              </View>
              <View style={styles.totalBar}>
                <Text style={styles.totalBarLabel}>Total</Text>
                <Text style={styles.totalBarVal}>
                  ₹ {Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* 8. Amount in Words */}
              <View style={styles.wordsRow}>
                <Text style={styles.wordsText}>{wordsAmount}</Text>
              </View>

              {/* 9. Settlement and Tax Breakdown Strip */}
              <View style={styles.taxStrip}>
                <Text style={styles.taxStripText}>
                  Settled by - Bank: ₹ {isPaid ? Number(total).toFixed(2) : '0.00'} | Invoice Balance: ₹ {isPaid ? '0.00' : Number(total).toFixed(2)}
                </Text>
                <Text style={styles.taxStripText}>
                  Tax @{taxRate}% : ₹ {Number(subtotal).toFixed(2)} | CGST ({halfTaxRate}%): ₹ {Number(cgst).toFixed(2)} | SGST ({halfTaxRate}%): ₹ {Number(sgst).toFixed(2)} | Total Tax: ₹ {Number(totalTax).toFixed(2)} | Add. Cess : 0.00
                </Text>
              </View>

              {/* 10. Bottom 4-Column Box */}
              <View style={styles.bottomQuad}>
                {/* Terms */}
                <View style={[styles.quadCol, styles.quadTerms]}>
                  <Text style={styles.quadHeading}>Terms and Conditions:</Text>
                  <Text style={styles.quadText}>1. E.& O.E.</Text>
                  <Text style={styles.quadText}>2. Goods once sold / services rendered will not be taken back.</Text>
                  <Text style={styles.quadText}>3. Interest @ 18% p.a. will be charged if payment is not made within stipulated time.</Text>
                  <Text style={styles.quadText}>4. Subject to 'Mumbai' jurisdiction only.</Text>
                </View>

                {/* Bank */}
                <View style={[styles.quadCol, styles.quadBank]}>
                  <Text style={styles.quadText}>Account Number: 123456789012</Text>
                  <Text style={styles.quadText}>Bank: HDFC Bank</Text>
                  <Text style={styles.quadText}>IFSC: HDFC0000123</Text>
                  <Text style={styles.quadText}>Branch: Nariman Point</Text>
                  <Text style={styles.quadText}>Name: CA Connect & Associates</Text>
                </View>

                {/* E-Invoice QR */}
                <View style={[styles.quadCol, styles.quadQr]}>
                  <Text style={styles.quadHeadingCenter}>E-Invoice QR</Text>
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={44} color="#111111" />
                  </View>
                </View>

                {/* Signatory */}
                <View style={[styles.quadCol, styles.quadSign]}>
                  <Text style={styles.signFirm}>For CA Connect & Associates</Text>
                  <View style={styles.signLineBox}>
                    <Text style={styles.signAuthor}>Authorized Signatory</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Footer Tag */}
            <Text style={styles.bottomCredit}>Invoice Created by www.caconnect.in</Text>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {invoice.status !== 'PAID' && onMarkPaid && (
                <AppButton
                  title={
                    isProcessing
                      ? 'Processing...'
                      : isAdmin
                      ? 'Record as Paid'
                      : `Settle Fee (${formatCurrency(total)})`
                  }
                  size="md"
                  onPress={() => onMarkPaid(invoice.id)}
                  loading={isProcessing}
                  style={styles.primaryAction}
                />
              )}
              <AppButton
                title="Close"
                variant="outline"
                size="md"
                onPress={onClose}
                style={invoice.status === 'PAID' ? { flex: 1 } : styles.secondaryAction}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  modalCard: {
    width: '100%',
    maxWidth: 780,
    maxHeight: '94%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    overflow: 'hidden',
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  controlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlRef: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#0F172A',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  toolBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    color: Colors.primary,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  scroll: {
    padding: Spacing.md,
  },
  formalInvoiceSheet: {
    borderWidth: 1.5,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  docHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  docHeaderSmall: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#000000',
  },
  docHeaderTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#000000',
    letterSpacing: 0.5,
  },
  docFirmBlock: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  docLogoBox: {
    width: 80,
    borderRightWidth: 1.5,
    borderRightColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  docLogoSquare: {
    width: 54,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docLogoText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#334155',
  },
  docFirmInfo: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  docFirmName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#000000',
    letterSpacing: 0.5,
  },
  docFirmSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: '#111111',
    marginTop: 1,
  },
  docFirmTax: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#000000',
    marginTop: 2,
  },
  docTwoCol: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  docHalfCol: {
    flex: 1,
    padding: 6,
  },
  docBorderRight: {
    borderRightWidth: 1.5,
    borderRightColor: '#000000',
  },
  docMetaRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  docMetaLabel: {
    width: 120,
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: '#111111',
  },
  docMetaVal: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#000000',
  },
  docColTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#000000',
    marginBottom: 3,
  },
  docColUnderline: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#000000',
    marginBottom: 3,
    textDecorationLine: 'underline',
  },
  docMetaBold: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#000000',
  },
  docMetaSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 9.5,
    color: '#111111',
    marginTop: 1,
  },
  docRefBar: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  docRefText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 9.5,
    color: '#000000',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  thCell: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tdCell: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 9.5,
    color: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  tSr: { width: 28, textAlign: 'center' },
  tDesc: { flex: 1 },
  tSac: { width: 55, textAlign: 'center' },
  tQty: { width: 38, textAlign: 'right' },
  tUnit: { width: 38, textAlign: 'center' },
  tRate: { width: 62, textAlign: 'right' },
  tDisc: { width: 44, textAlign: 'right' },
  tTax: { width: 46, textAlign: 'right' },
  tAmt: { width: 68, textAlign: 'right', borderRightWidth: 0 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopWidth: 1.5,
    borderTopColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: '#000000',
  },
  summaryVal: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#000000',
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  totalBarLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: '#000000',
  },
  totalBarVal: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: '#000000',
  },
  wordsRow: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  wordsText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#000000',
  },
  taxStrip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  taxStripText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 9,
    color: '#000000',
    lineHeight: 13,
  },
  bottomQuad: {
    flexDirection: 'row',
    minHeight: 110,
  },
  quadCol: {
    padding: 6,
    borderRightWidth: 1.5,
    borderRightColor: '#000000',
  },
  quadTerms: {
    width: '30%',
  },
  quadBank: {
    width: '30%',
  },
  quadQr: {
    width: '18%',
    alignItems: 'center',
  },
  quadSign: {
    flex: 1,
    borderRightWidth: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quadHeading: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#000000',
    marginBottom: 2,
  },
  quadHeadingCenter: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 2,
  },
  qrPlaceholder: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quadText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 8.5,
    color: '#111111',
    lineHeight: 11,
    marginBottom: 2,
  },
  signFirm: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#000000',
    textAlign: 'right',
  },
  signLineBox: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 3,
    width: 110,
    alignItems: 'center',
  },
  signAuthor: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 9,
    color: '#000000',
  },
  bottomCredit: {
    textAlign: 'center',
    paddingVertical: 8,
    fontFamily: Typography.fontFamily.regular,
    fontSize: 9.5,
    color: '#2563EB',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    width: 100,
  },
});
