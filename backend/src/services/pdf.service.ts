import PDFDocument from 'pdfkit';

export const generateInvoicePdf = (invoice: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header Banner / Logo Placeholder
      doc
        .fillColor('#1e3a8a')
        .rect(0, 0, 595.28, 80) // A4 width is 595.28
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CA CONNECT & ASSOCIATES', 50, 25)
        .fontSize(9)
        .font('Helvetica')
        .text('Chartered Accountants · Tax Advisors · Corporate Consultants', 50, 50);

      // Invoice Title
      doc
        .fillColor('#1e293b')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 450, 100, { align: 'right' });

      // CA Firm Details (Left side)
      const caFirmX = 50;
      let y = 100;
      doc
        .fillColor('#475569')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('FROM:', caFirmX, y)
        .font('Helvetica')
        .text('CA Connect & Associates LLP', caFirmX, y + 15)
        .text('Suite 402, Financial District', caFirmX, y + 30)
        .text('Mumbai, Maharashtra - 400001', caFirmX, y + 45)
        .text('GSTIN: 27AAAAA1111A1Z1', caFirmX, y + 60)
        .text('PAN: AAAAA1111A', caFirmX, y + 75)
        .text('Email: billing@caconnect.in', caFirmX, y + 90);

      // Invoice Details & Client details
      const detailX = 350;
      doc
        .fillColor('#475569')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('INVOICE NO:', detailX, y + 15)
        .font('Helvetica')
        .text(invoice.invoiceNumber, detailX + 90, y + 15)
        .font('Helvetica-Bold')
        .text('DATE:', detailX, y + 30)
        .font('Helvetica')
        .text(new Date(invoice.issueDate).toLocaleDateString('en-IN'), detailX + 90, y + 30)
        .font('Helvetica-Bold')
        .text('DUE DATE:', detailX, y + 45)
        .font('Helvetica')
        .text(new Date(invoice.dueDate).toLocaleDateString('en-IN'), detailX + 90, y + 45)
        .font('Helvetica-Bold')
        .text('STATUS:', detailX, y + 60)
        .fillColor(invoice.status === 'PAID' ? '#16a34a' : '#dc2626')
        .text(invoice.status, detailX + 90, y + 60);

      doc.fillColor('#475569');

      // Client details (Left side, lower)
      y = 210;
      const client = invoice.clientProfile || {};
      const clientUser = client.user || {};
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('BILL TO:', caFirmX, y)
        .font('Helvetica')
        .text(`${clientUser.firstName || ''} ${clientUser.lastName || ''}`, caFirmX, y + 15)
        .text(client.firmName || 'Individual Client', caFirmX, y + 30)
        .text(client.address || 'Address not provided', caFirmX, y + 45)
        .text(`GSTIN: ${client.gstin || 'N/A'}`, caFirmX, y + 60)
        .text(`PAN: ${client.panNumber || 'N/A'}`, caFirmX, y + 75);

      // Draw horizontal line
      doc
        .moveTo(50, 310)
        .lineTo(545, 310)
        .strokeColor('#cbd5e1')
        .lineWidth(1)
        .stroke();

      // Items Table Header
      y = 325;
      doc
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Description', 50, y)
        .text('Qty', 320, y, { width: 40, align: 'right' })
        .text('Unit Price (Rs)', 380, y, { width: 80, align: 'right' })
        .text('Amount (Rs)', 470, y, { width: 75, align: 'right' });

      // Table Row Line
      doc
        .moveTo(50, y + 15)
        .lineTo(545, y + 15)
        .strokeColor('#94a3b8')
        .lineWidth(1)
        .stroke();

      // Items Rows
      y = 350;
      doc.fillColor('#334155').font('Helvetica');

      const items = invoice.items || [];
      items.forEach((item: any) => {
        doc
          .text(item.description, 50, y)
          .text(item.quantity.toString(), 320, y, { width: 40, align: 'right' })
          .text(item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 380, y, { width: 80, align: 'right' })
          .text(item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 470, y, { width: 75, align: 'right' });
        
        y += 25;
      });

      // Total Breakdown Section
      y = Math.max(y + 15, 450);

      // Draw lines above totals
      doc
        .moveTo(320, y)
        .lineTo(545, y)
        .strokeColor('#cbd5e1')
        .stroke();

      y += 10;
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 320, y, { width: 130, align: 'right' })
        .text(invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 470, y, { width: 75, align: 'right' });

      y += 20;
      const csgstRate = (invoice.taxRate / 2);
      doc
        .text(`CGST (${csgstRate}%):`, 320, y, { width: 130, align: 'right' })
        .text(invoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 470, y, { width: 75, align: 'right' });

      y += 20;
      doc
        .text(`SGST (${csgstRate}%):`, 320, y, { width: 130, align: 'right' })
        .text(invoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 470, y, { width: 75, align: 'right' });

      // If IGST is present
      if (invoice.igst > 0) {
        y += 20;
        doc
          .text(`IGST (${invoice.taxRate}%):`, 320, y, { width: 130, align: 'right' })
          .text(invoice.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 470, y, { width: 75, align: 'right' });
      }

      y += 25;
      doc
        .moveTo(320, y)
        .lineTo(545, y)
        .strokeColor('#1e3a8a')
        .lineWidth(1.5)
        .stroke();

      y += 10;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#1e3a8a')
        .text('Total Due:', 320, y, { width: 130, align: 'right' })
        .text(`Rs ${invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 470, y, { width: 75, align: 'right' });

      // Notes & Signature Section
      y += 50;
      doc
        .fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .text('Terms & Notes:', 50, y)
        .font('Helvetica')
        .text(invoice.notes || '1. Payments are due within the invoice due date.\n2. Please mention the invoice number in bank transfer ref.\n3. This is a computer-generated document, no signature is required.', 50, y + 15, { width: 250 });

      // CA Partner Signature box
      doc
        .rect(380, y, 165, 60)
        .strokeColor('#cbd5e1')
        .lineWidth(0.5)
        .stroke();

      doc
        .fontSize(8)
        .fillColor('#475569')
        .font('Helvetica-Bold')
        .text('For CA Connect & Associates LLP', 385, y + 5)
        .font('Helvetica')
        .text('Authorized Signatory', 385, y + 45, { align: 'center', width: 155 });

      // Bottom footer banner
      doc
        .fillColor('#f8fafc')
        .rect(0, 800, 595.28, 42)
        .fill();

      doc
        .fillColor('#94a3b8')
        .fontSize(8)
        .text('Thank you for your business!', 0, 815, { align: 'center', width: 595.28 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
