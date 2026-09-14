declare class EmailService {
    private transporter;
    constructor();
    private getTransporter;
    sendPasswordReset(email: string, token: string): Promise<void>;
    sendInvoiceNotification(email: string, clientName: string, invoiceNumber: string, amount: number, downloadUrl: string): Promise<void>;
    sendEmailVerification(email: string, token: string): Promise<void>;
    sendAppointmentNotification(email: string, clientName: string, title: string, scheduledDate: string, meetingLink: string, notes?: string): Promise<void>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=email.service.d.ts.map