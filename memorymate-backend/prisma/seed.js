// prisma/seed.js
// Seeds the database with demo data for development/testing

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo patient
  const patient = await prisma.user.upsert({
    where: { email: 'patient@demo.com' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'patient@demo.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'PATIENT',
      inviteCode: 'DEMO01',
    },
  });

  // Create a demo caregiver
  const caregiver = await prisma.user.upsert({
    where: { email: 'caregiver@demo.com' },
    update: {},
    create: {
      name: 'Sarah Smith',
      email: 'caregiver@demo.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'CAREGIVER',
    },
  });

  // Link them
  await prisma.patientCaregiverLink.upsert({
    where: {
      patientId_caregiverId: {
        patientId: patient.id,
        caregiverId: caregiver.id,
      },
    },
    update: {},
    create: {
      patientId: patient.id,
      caregiverId: caregiver.id,
      relationship: 'daughter',
      status: 'ACCEPTED',
    },
  });

  // Add demo routines
  const routineTimes = [
    { title: 'Morning Medication', scheduleTime: '08:00', type: 'MEDICATION', description: 'Take blood pressure tablet with water' },
    { title: 'Lunch', scheduleTime: '12:30', type: 'MEAL', description: 'Time for lunch' },
    { title: 'Evening Walk', scheduleTime: '17:00', type: 'OTHER', description: 'Short walk around the garden' },
    { title: 'Evening Medication', scheduleTime: '20:00', type: 'MEDICATION', description: 'Take sleeping tablet' },
  ];

  for (const r of routineTimes) {
    await prisma.routine.create({
      data: {
        patientId: patient.id,
        createdById: caregiver.id,
        ...r,
      },
    });
  }

  // Add a demo safe zone (home area)
  await prisma.safeZone.create({
    data: {
      patientId: patient.id,
      createdById: caregiver.id,
      name: 'Home Area',
      centerLat: 51.5074,  // London — change to your location
      centerLng: -0.1278,
      radiusMeters: 300,
    },
  });

  console.log('✅ Seed complete!');
  console.log('   Patient  : patient@demo.com  / password123');
  console.log('   Caregiver: caregiver@demo.com / password123');
  console.log(`   Patient invite code: DEMO01`);
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
