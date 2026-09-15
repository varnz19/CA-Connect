"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
function numberToIndianWords(num) {
    if (isNaN(num) || num === 0)
        return 'Zero Only';
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convertTwoDigits = (n) => {
        if (n < 20)
            return a[n];
        const tens = b[Math.floor(n / 10)];
        const ones = a[n % 10];
        return tens + (ones ? ' ' + ones : '');
    };
    const convertThreeDigits = (n) => {
        const hundred = Math.floor(n / 100);
        const rest = n % 100;
        let result = '';
        if (hundred > 0) {
            result += a[hundred] + ' Hundred';
        }
        if (rest > 0) {
            result += (result ? ' ' : '') + convertTwoDigits(rest);
        }
        return result;
    };
    let integerPart = Math.floor(Math.abs(num));
    let result = '';
    const crore = Math.floor(integerPart / 10000000);
    integerPart %= 10000000;
    const lakh = Math.floor(integerPart / 100000);
    integerPart %= 100000;
    const thousand = Math.floor(integerPart / 1000);
    integerPart %= 1000;
    const hundreds = integerPart;
    if (crore > 0) {
        result += convertThreeDigits(crore) + ' Crore ';
    }
    if (lakh > 0) {
        result += convertThreeDigits(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        result += convertThreeDigits(thousand) + ' Thousand ';
    }
    if (hundreds > 0) {
        result += convertThreeDigits(hundreds);
    }
    result = result.trim();
    return result ? `Rs. ${result} Only` : 'Zero Only';
}
const generateInvoicePdf = (invoice) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 30, size: 'A4' });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const boxX = 35;
            const boxY = 35;
            const boxW = 525.28;
            const midX = boxX + boxW / 2;
            // Extract details
            const clientProfile = invoice.clientProfile || {};
            const clientUser = clientProfile.user || invoice.client || {};
            const clientName = clientProfile.firmName || `${clientUser.firstName || ''} ${clientUser.lastName || ''}`.trim() || 'Client Account';
            const clientGstin = clientProfile.gstin || '-';
            const clientPhone = clientUser.phone || '-';
            const clientEmail = clientUser.email || '-';
            const clientAddress = clientProfile.address || 'Address not specified';
            const clientState = clientProfile.gstState || '-';
            const issueDateStr = new Date(invoice.issueDate || Date.now()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            const dueDateStr = new Date(invoice.dueDate || Date.now()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            const subtotal = invoice.subtotal || 0;
            const taxRate = invoice.taxRate || 18;
            const cgst = invoice.cgst || (subtotal * (taxRate / 2)) / 100;
            const sgst = invoice.sgst || (subtotal * (taxRate / 2)) / 100;
            const total = invoice.total || subtotal + cgst + sgst;
            const isPaid = invoice.status === 'PAID';
            // 1. Top Header Strip (Page No, TAX INVOICE, Original Copy)
            let currY = boxY;
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('Page No. 1 of 1', boxX + 6, currY + 6)
                .fontSize(12)
                .text('TAX INVOICE', boxX, currY + 4, { width: boxW, align: 'center' })
                .fontSize(9)
                .text('Original Copy', boxX, currY + 6, { width: boxW - 6, align: 'right' });
            currY += 22;
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            // 2. Firm Header Box (Add Logo on left, Company Name & Details centered)
            const firmBlockHeight = 68;
            // Logo box
            const logoW = 80;
            doc
                .rect(boxX + 15, currY + 8, 50, 50)
                .strokeColor('#666666')
                .lineWidth(1)
                .stroke();
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#444444')
                .text('Add\nLogo', boxX + 15, currY + 22, { width: 50, align: 'center' });
            // Vertical line separating logo
            doc
                .moveTo(boxX + logoW, currY)
                .lineTo(boxX + logoW, currY + firmBlockHeight)
                .strokeColor('#000000')
                .lineWidth(1)
                .stroke();
            // Company info centered
            doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('CA CONNECT & ASSOCIATES', boxX + logoW, currY + 8, { width: boxW - logoW, align: 'center' })
                .fontSize(9)
                .font('Helvetica')
                .text('Suite 402, Financial District, Nariman Point, Mumbai - 400021', boxX + logoW, currY + 26, { width: boxW - logoW, align: 'center' })
                .text('Mobile: +91 9876543210, Email: billing@caconnect.in', boxX + logoW, currY + 38, { width: boxW - logoW, align: 'center' })
                .font('Helvetica-Bold')
                .text('GSTIN: 27AAAAA1111A1Z1 | PAN: AAAAA1111A', boxX + logoW, currY + 50, { width: boxW - logoW, align: 'center' });
            currY += firmBlockHeight;
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            // 3. Two-Column Metadata (Invoice Number vs Transporter Details)
            const metaHeight = 85;
            // Vertical divider
            doc
                .moveTo(midX, currY)
                .lineTo(midX, currY + metaHeight)
                .strokeColor('#000000')
                .lineWidth(1)
                .stroke();
            // Left: Invoice details
            let my = currY + 5;
            const leftColX = boxX + 6;
            doc.fontSize(8.5).font('Helvetica');
            doc.text('Invoice Number:', leftColX, my).font('Helvetica-Bold').text(invoice.invoiceNumber, leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Invoice Date:', leftColX, my).font('Helvetica-Bold').text(issueDateStr, leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Due date:', leftColX, my).font('Helvetica-Bold').text(dueDateStr, leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Place of Supply:', leftColX, my).font('Helvetica-Bold').text(clientState, leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Reverse Charge:', leftColX, my).font('Helvetica-Bold').text('No', leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Optional Field 1:', leftColX, my).font('Helvetica').text('-', leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Optional Field 2:', leftColX, my).font('Helvetica').text('-', leftColX + 90, my);
            my += 10;
            doc.font('Helvetica').text('Optional Field 3:', leftColX, my).font('Helvetica').text('-', leftColX + 90, my);
            // Right: Transporter details
            my = currY + 5;
            const rightColX = midX + 6;
            doc.fontSize(8.5).font('Helvetica-Bold').text('Transporter Details:', rightColX, my);
            my += 10;
            doc.font('Helvetica').text('Transporter:', rightColX, my).font('Helvetica-Bold').text('Direct Transportation / Portal', rightColX + 100, my);
            my += 10;
            doc.font('Helvetica').text('Vehicle No:', rightColX, my).font('Helvetica-Bold').text('MH01CA1234', rightColX + 100, my);
            my += 10;
            doc.font('Helvetica').text('Transporter Doc No:', rightColX, my).font('Helvetica-Bold').text(`DOC/CAC/${invoice.invoiceNumber.replace(/[^0-9]/g, '') || '1234'}`, rightColX + 100, my);
            my += 10;
            doc.font('Helvetica').text('Transporter Doc Date:', rightColX, my).font('Helvetica-Bold').text(issueDateStr, rightColX + 100, my);
            my += 10;
            doc.font('Helvetica').text('E-Way Bill No:', rightColX, my).font('Helvetica-Bold').text('271234567890', rightColX + 100, my);
            my += 10;
            doc.font('Helvetica').text('E-Way Bill Date:', rightColX, my).font('Helvetica-Bold').text(issueDateStr, rightColX + 100, my);
            currY += metaHeight;
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            // 4. Two-Column Billing & Shipping Details
            const partyHeight = 60;
            doc.moveTo(midX, currY).lineTo(midX, currY + partyHeight).strokeColor('#000000').lineWidth(1).stroke();
            // Billing Details (Left)
            my = currY + 4;
            doc.fontSize(9).font('Helvetica-Bold').text('Billing Details', leftColX, my, { underline: true });
            my += 12;
            doc.fontSize(8.5).font('Helvetica-Bold').text(`Name: ${clientName}`, leftColX, my);
            my += 10;
            doc.font('Helvetica').text(`GSTIN: ${clientGstin} | Mobile: ${clientPhone}`, leftColX, my);
            my += 10;
            doc.text(`Email: ${clientEmail}`, leftColX, my);
            my += 10;
            doc.text(`Add Address: ${clientAddress}`, leftColX, my);
            // Shipping Details (Right)
            my = currY + 4;
            doc.fontSize(9).font('Helvetica-Bold').text('Shipping Details', rightColX, my, { underline: true });
            my += 12;
            doc.fontSize(8.5).font('Helvetica-Bold').text(`Name: ${clientName}`, rightColX, my);
            my += 10;
            doc.font('Helvetica').text(`GSTIN: ${clientGstin} | Mobile: ${clientPhone}`, rightColX, my);
            my += 10;
            doc.text(`Email: ${clientEmail}`, rightColX, my);
            my += 10;
            doc.text(`Add Address: ${clientAddress}`, rightColX, my);
            currY += partyHeight;
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            // 5. PO / Job Reference Bar
            const refHeight = 16;
            doc
                .fontSize(8.5)
                .font('Helvetica-Bold')
                .text(`PO/Ref No: PO-CAC-${invoice.invoiceNumber.replace(/[^0-9]/g, '') || '2026'}   |   Job No: CAC/JOB-4820   |   Job Date: ${issueDateStr}`, boxX + 6, currY + 4);
            currY += refHeight;
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            // 6. Items Table
            // Column x positions:
            // Sr: 35..60 (w:25)
            // Desc: 60..250 (w:190)
            // SAC: 250..295 (w:45)
            // Qty: 295..325 (w:30)
            // Unit: 325..355 (w:30)
            // List Price: 355..415 (w:60)
            // Disc: 415..450 (w:35)
            // Tax%: 450..485 (w:35)
            // Amount: 485..560.28 (w:75.28)
            const thY = currY;
            const thH = 18;
            doc.fontSize(8.5).font('Helvetica-Bold');
            doc.text('Sr.', boxX + 2, thY + 4, { width: 25, align: 'center' });
            doc.text('Item Description', boxX + 30, thY + 4, { width: 185, align: 'left' });
            doc.text('HSN/SAC', boxX + 218, thY + 4, { width: 42, align: 'center' });
            doc.text('Qty', boxX + 262, thY + 4, { width: 30, align: 'right' });
            doc.text('Unit', boxX + 295, thY + 4, { width: 28, align: 'center' });
            doc.text('List Price', boxX + 325, thY + 4, { width: 55, align: 'right' });
            doc.text('Disc.', boxX + 382, thY + 4, { width: 32, align: 'right' });
            doc.text('Tax %', boxX + 416, thY + 4, { width: 32, align: 'right' });
            doc.text('Amount (Rs)', boxX + 450, thY + 4, { width: 70, align: 'right' });
            currY += thH;
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            // Items Data Rows
            const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
                { description: 'Statutory Audit & Professional Tax Compliance Services', quantity: 1, unitPrice: subtotal, amount: subtotal }
            ];
            items.forEach((item, idx) => {
                const rowH = 20;
                doc.fontSize(8.5).font('Helvetica');
                doc.text((idx + 1).toString(), boxX + 2, currY + 5, { width: 25, align: 'center' });
                doc.text(item.description, boxX + 30, currY + 5, { width: 185, align: 'left' });
                doc.text('998221', boxX + 218, currY + 5, { width: 42, align: 'center' });
                doc.text(Number(item.quantity).toFixed(1), boxX + 262, currY + 5, { width: 30, align: 'right' });
                doc.text('Nos', boxX + 295, currY + 5, { width: 28, align: 'center' });
                doc.text(Number(item.unitPrice).toFixed(2), boxX + 325, currY + 5, { width: 55, align: 'right' });
                doc.text('0.00', boxX + 382, currY + 5, { width: 32, align: 'right' });
                doc.text(Number(taxRate).toFixed(2), boxX + 416, currY + 5, { width: 32, align: 'right' });
                doc.text(Number(item.amount || item.quantity * item.unitPrice).toFixed(2), boxX + 450, currY + 5, { width: 70, align: 'right' });
                currY += rowH;
            });
            // Pad items area if short
            if (items.length < 3) {
                currY = Math.max(currY, 430);
            }
            // Draw table vertical grid lines for the items section
            const colSplits = [boxX + 27, boxX + 216, boxX + 260, boxX + 293, boxX + 323, boxX + 380, boxX + 414, boxX + 448];
            colSplits.forEach((x) => {
                doc.moveTo(x, thY).lineTo(x, currY).strokeColor('#CBD5E1').lineWidth(0.5).stroke();
            });
            // Discount row
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            doc.fontSize(8.5).font('Helvetica').text('Discount:', boxX + 6, currY + 4);
            doc.text('0.00', boxX + 450, currY + 4, { width: 70, align: 'right' });
            currY += 16;
            // Total row
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            doc.fontSize(9.5).font('Helvetica-Bold').text('Total', boxX + 6, currY + 4);
            doc.text(`Rs. ${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, boxX + 400, currY + 4, { width: 120, align: 'right' });
            currY += 18;
            // 7. Amount in Words
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            const words = numberToIndianWords(total);
            doc.fontSize(8.5).font('Helvetica-Bold').text(words, boxX + 6, currY + 4);
            currY += 16;
            // 8. Tax Breakdown Strip
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            const halfRate = (taxRate / 2).toFixed(2);
            doc.fontSize(7.5).font('Helvetica');
            doc.text(`Settled by - Bank: Rs. ${isPaid ? total.toFixed(2) : '0.00'}  |  Invoice Balance: Rs. ${isPaid ? '0.00' : total.toFixed(2)}`, boxX + 6, currY + 3);
            doc.text(`Tax @${taxRate}% : Rs. ${subtotal.toFixed(2)}  |  CGST (${halfRate}%): Rs. ${cgst.toFixed(2)}  |  SGST (${halfRate}%): Rs. ${sgst.toFixed(2)}  |  Total Tax: Rs. ${(cgst + sgst).toFixed(2)}  |  Add. Cess: 0.00`, boxX + 6, currY + 12);
            currY += 23;
            // 9. Bottom 4-Column Box
            doc.moveTo(boxX, currY).lineTo(boxX + boxW, currY).strokeColor('#000000').lineWidth(1).stroke();
            const bottomBoxH = 88;
            const bCol1W = 155;
            const bCol2W = 145;
            const bCol3W = 95;
            const bCol4W = boxW - bCol1W - bCol2W - bCol3W;
            // Dividers
            const x1 = boxX + bCol1W;
            const x2 = x1 + bCol2W;
            const x3 = x2 + bCol3W;
            doc.moveTo(x1, currY).lineTo(x1, currY + bottomBoxH).strokeColor('#000000').lineWidth(1).stroke();
            doc.moveTo(x2, currY).lineTo(x2, currY + bottomBoxH).strokeColor('#000000').lineWidth(1).stroke();
            doc.moveTo(x3, currY).lineTo(x3, currY + bottomBoxH).strokeColor('#000000').lineWidth(1).stroke();
            // Col 1: Terms
            doc.fontSize(7.5).font('Helvetica-Bold').text('Terms and Conditions:', boxX + 4, currY + 4);
            doc.fontSize(6.8).font('Helvetica')
                .text('1. E.& O.E.', boxX + 4, currY + 15)
                .text('2. Services once rendered cannot be revoked.', boxX + 4, currY + 25)
                .text('3. Interest @ 18% p.a. will be charged if payment is not made within the stipulated due date.', boxX + 4, currY + 35, { width: bCol1W - 8 })
                .text('4. Subject to Mumbai jurisdiction only.', boxX + 4, currY + 58);
            // Col 2: Bank details
            doc.fontSize(7.5).font('Helvetica')
                .text('Account Number: 123456789012', x1 + 6, currY + 6)
                .text('Bank: HDFC Bank', x1 + 6, currY + 18)
                .text('IFSC: HDFC0000123', x1 + 6, currY + 30)
                .text('Branch: Nariman Point, Mumbai', x1 + 6, currY + 42)
                .font('Helvetica-Bold')
                .text('Name: CA Connect & Associates', x1 + 6, currY + 54);
            // Col 3: E-Invoice QR Placeholder Box
            doc.fontSize(7.5).font('Helvetica-Bold').text('E-Invoice QR', x2 + 4, currY + 4, { width: bCol3W - 8, align: 'center' });
            doc.rect(x2 + (bCol3W - 50) / 2, currY + 16, 50, 50).strokeColor('#444444').lineWidth(1).stroke();
            doc.fontSize(6.5).font('Helvetica').text('E-INV\nQR', x2 + (bCol3W - 50) / 2, currY + 32, { width: 50, align: 'center' });
            // Col 4: For CA Connect & Signatory
            doc.fontSize(7.5).font('Helvetica-Bold').text('For CA Connect & Associates', x3 + 4, currY + 6, { width: bCol4W - 8, align: 'right' });
            doc.moveTo(x3 + 15, currY + 65).lineTo(boxX + boxW - 10, currY + 65).strokeColor('#000000').lineWidth(0.8).stroke();
            doc.fontSize(7.5).font('Helvetica').text('Authorized Signatory', x3 + 4, currY + 68, { width: bCol4W - 8, align: 'center' });
            currY += bottomBoxH;
            // Outer border around the complete invoice
            doc.rect(boxX, boxY, boxW, currY - boxY).strokeColor('#000000').lineWidth(1.5).stroke();
            // 10. Footer brand
            doc.fontSize(7.5).font('Helvetica').fillColor('#2563EB').text('Invoice Created by www.caconnect.in', boxX, currY + 6, { width: boxW, align: 'center' });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.generateInvoicePdf = generateInvoicePdf;
//# sourceMappingURL=pdf.service.js.map