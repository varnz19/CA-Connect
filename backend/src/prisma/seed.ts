import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@caconnect.in' },
    update: { isVerified: true },
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@caconnect.in',
      password: adminPassword,
      role: Role.ADMIN,
      firstName: 'CA',
      lastName: 'Admin',
      phone: '+91-9876543210',
      isVerified: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create a demo client
  const clientPassword = await bcrypt.hash('Client@123', 12);

  const demoClient = await prisma.user.upsert({
    where: { email: 'rajesh.kumar@example.com' },
    update: { isVerified: true },
    create: {
      email: 'rajesh.kumar@example.com',
      password: clientPassword,
      role: Role.CLIENT,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-9876500001',
      isVerified: true,
      clientProfile: {
        create: {
          clientCode: 'CAC001',
          firmName: 'Rajesh Kumar & Co.',
          panNumber: 'ABCDE1234F',
          gstin: '27ABCDE1234F1Z5',
          gstState: 'Maharashtra',
          adminId: admin.id,
        },
      },
    },
    include: { clientProfile: true },
  });

  console.log('✅ Demo client created:', demoClient.email);

  // Seed global calendar events (Indian tax deadlines)
  const currentYear = new Date().getFullYear();
  const taxDeadlines = [
    { title: 'GST Return (GSTR-1)', date: new Date(`${currentYear}-04-11`), type: 'FILING_DEADLINE' },
    { title: 'GST Return (GSTR-3B)', date: new Date(`${currentYear}-04-20`), type: 'FILING_DEADLINE' },
    { title: 'TDS Payment', date: new Date(`${currentYear}-04-07`), type: 'TAX_DEADLINE' },
    { title: 'Income Tax Advance Tax (Q1)', date: new Date(`${currentYear}-06-15`), type: 'TAX_DEADLINE' },
    { title: 'Income Tax Advance Tax (Q2)', date: new Date(`${currentYear}-09-15`), type: 'TAX_DEADLINE' },
    { title: 'Income Tax Advance Tax (Q3)', date: new Date(`${currentYear}-12-15`), type: 'TAX_DEADLINE' },
    { title: 'ITR Filing Deadline', date: new Date(`${currentYear}-07-31`), type: 'FILING_DEADLINE' },
    { title: 'GST Annual Return (GSTR-9)', date: new Date(`${currentYear}-12-31`), type: 'FILING_DEADLINE' },
    { title: 'ROC Annual Filing', date: new Date(`${currentYear}-11-30`), type: 'FILING_DEADLINE' },
    { title: 'TDS Return Q1', date: new Date(`${currentYear}-07-31`), type: 'FILING_DEADLINE' },
    { title: 'TDS Return Q2', date: new Date(`${currentYear}-10-31`), type: 'FILING_DEADLINE' },
  ];

  for (const event of taxDeadlines) {
    await prisma.calendarEvent.upsert({
      where: { id: `global-${event.title.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `global-${event.title.replace(/\s/g, '-').toLowerCase()}`,
        ...event,
        isGlobal: true,
      },
    });
  }

  console.log('✅ Calendar events seeded');
  console.log('\n📋 Admin Credentials:');
  console.log('   Email:', process.env.ADMIN_EMAIL || 'admin@caconnect.in');
  console.log('   Password:', process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123');
  console.log('\n📋 Demo Client Credentials:');
  console.log('   Email: rajesh.kumar@example.com');
  console.log('   Password: Client@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
