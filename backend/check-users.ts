import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, googleId: true, firstName: true, lastName: true, isVerified: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log('=== ALL USERS IN DATABASE ===');
  console.log(JSON.stringify(users, null, 2));
  console.log(`\nTotal users: ${users.length}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
