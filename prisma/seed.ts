import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Check if SUPER_ADMIN user already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN,
    },
  });

  if (existingSuperAdmin) {
    console.log('SUPER_ADMIN user already exists. Skipping seed.');
    console.log('SUPER_ADMIN email:', existingSuperAdmin.email);
    return;
  }

  // Create default SUPER_ADMIN user (Organization Admin)
  const superAdminEmail = 'superadmin@itc.com';
  const superAdminPassword = 'SuperAdmin123!@#';

  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      passwordHash,
      country: 'United States',
      countryCode: '+1',
      phoneNumber: '0000000000',
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log('✓ SUPER_ADMIN user created successfully!');
  console.log('=========================================');
  console.log('SUPER_ADMIN CREDENTIALS (SAVE THESE):');
  console.log('Email:', superAdminEmail);
  console.log('Password:', superAdminPassword);
  console.log('Role: SUPER_ADMIN (Organization Admin)');
  console.log('=========================================');
  console.log('IMPORTANT: Change the SUPER_ADMIN password after first login!');
  console.log('SUPER_ADMIN user ID:', superAdmin.id);
  console.log('\nThis is the only SUPER_ADMIN account.');
  console.log('SUPER_ADMIN can promote USER to ADMIN and manage all users.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
