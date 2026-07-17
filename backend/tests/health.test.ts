import request from 'supertest';
import { app } from '../src/index';
import { generateInvoicePdf } from '../src/services/pdf.service';

describe('Backend API Tests', () => {
  it('should return health check status successfully', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('CA Connect API is running');
  });

  it('should fail authentication with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@caconnect.in', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully generate an invoice PDF buffer', async () => {
    const mockInvoice = {
      invoiceNumber: 'CAC/2026-27/999',
      issueDate: new Date(),
      dueDate: new Date(),
      status: 'PENDING',
      taxRate: 18,
      subtotal: 1000,
      cgst: 90,
      sgst: 90,
      igst: 0,
      total: 1180,
      notes: 'Test invoice',
      items: [
        {
          id: 'item-1',
          description: 'Accounting services',
          quantity: 1,
          unitPrice: 1000,
          amount: 1000,
        },
      ],
      clientProfile: {
        firmName: 'Demo Client Firm',
        address: '123 Business Rd',
        gstin: '27ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        user: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
        },
      },
    };

    const pdfBuffer = await generateInvoicePdf(mockInvoice);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // PDF magic number check (%PDF-)
    expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
  });
});
