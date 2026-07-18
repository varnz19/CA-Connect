"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = null;
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (host && user && pass) {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
        }
        else {
            console.log('✉️ SMTP credentials not fully configured. Using fallback/console logging for mail delivery.');
        }
    }
    async getTransporter() {
        if (this.transporter)
            return this.transporter;
        // Fallback: Create ethereal test account for testing
        try {
            const testAccount = await nodemailer_1.default.createTestAccount();
            this.transporter = nodemailer_1.default.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            return this.transporter;
        }
        catch (err) {
            // Return a dummy transporter that logs to console
            return {
                sendMail: async (options) => {
                    console.log(`✉️ DUMMY EMAIL TO [${options.to}]: Subject: ${options.subject}\nBody:\n${options.text}`);
                    return { messageId: 'dummy-id' };
                },
            };
        }
    }
    async sendPasswordReset(email, token) {
        const transporter = await this.getTransporter();
        const resetUrl = `http://localhost:8085/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.SMTP_FROM || '"CA Connect" <noreply@caconnect.in>',
            to: email,
            subject: 'Reset Password - CA Connect',
            text: `You requested a password reset for your CA Connect account.\n\nPlease click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link is valid for 1 hour.`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #3b82f6; text-align: center;">CA Connect</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your CA Connect account.</p>
          <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${resetUrl}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated email, please do not reply.</p>
        </div>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        if ('messageId' in info && info.messageId) {
            const nodemailerUrl = nodemailer_1.default.getTestMessageUrl(info);
            if (nodemailerUrl) {
                console.log(`✉️ Fallback email sent. Preview URL: ${nodemailerUrl}`);
            }
            else {
                console.log(`✉️ Password reset email sent successfully to ${email}`);
            }
        }
    }
    async sendInvoiceNotification(email, clientName, invoiceNumber, amount, downloadUrl) {
        const transporter = await this.getTransporter();
        const mailOptions = {
            from: process.env.SMTP_FROM || '"CA Connect" <noreply@caconnect.in>',
            to: email,
            subject: `New GST Invoice Generated - ${invoiceNumber}`,
            text: `Dear ${clientName},\n\nA new GST Invoice has been generated for your services.\n\nInvoice Number: ${invoiceNumber}\nTotal Amount: INR ${amount.toFixed(2)}\n\nYou can download the invoice PDF directly by clicking the link below:\n\n${downloadUrl}\n\nThank you for your business.`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0b2545; text-align: center;">CA Connect Billing</h2>
          <p>Dear ${clientName},</p>
          <p>A new GST Invoice has been generated for your services.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 4px 0;"><strong>Total Amount:</strong> INR ${amount.toFixed(2)}</p>
          </div>
          <p>Please click the button below to download the professional invoice PDF directly:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background-color: #0b2545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Download Invoice PDF</a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated billing statement, please do not reply.</p>
        </div>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        if ('messageId' in info && info.messageId) {
            const nodemailerUrl = nodemailer_1.default.getTestMessageUrl(info);
            if (nodemailerUrl) {
                console.log(`✉️ Invoice email preview link: ${nodemailerUrl}`);
            }
            else {
                console.log(`✉️ Invoice notification sent to ${email}`);
            }
        }
    }
    async sendEmailVerification(email, token) {
        const transporter = await this.getTransporter();
        const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;
        const mailOptions = {
            from: process.env.SMTP_FROM || '"CA Connect" <noreply@caconnect.in>',
            to: email,
            subject: 'Verify Email - CA Connect',
            text: `Welcome to CA Connect!\n\nPlease click on the following link or paste it into your browser to verify your email address:\n\n${verificationUrl}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0b2545; text-align: center;">CA Connect</h2>
          <p>Hello,</p>
          <p>Welcome to CA Connect! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0b2545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${verificationUrl}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated email, please do not reply.</p>
        </div>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        if ('messageId' in info && info.messageId) {
            const nodemailerUrl = nodemailer_1.default.getTestMessageUrl(info);
            if (nodemailerUrl) {
                console.log(`✉️ Email verification preview link: ${nodemailerUrl}`);
            }
            else {
                console.log(`✉️ Verification email sent successfully to ${email}`);
            }
        }
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map