import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seeding...');

  // Hashing password for all mock accounts
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hms.com' },
    update: {},
    create: {
      email: 'admin@hms.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      firstName: 'Chief',
      lastName: 'Administrator',
      phone: '+1 (555) 010-0001',
      avatarUrl: null
    }
  });
  console.log('Admin user seeded:', admin.email);

  // 2. Create Doctors
  const doc1Data = {
    email: 'john.smith@hms.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'DOCTOR',
    phone: '+1 (555) 010-0002',
    avatarUrl: null
  };
  const doc1 = await prisma.user.upsert({
    where: { email: doc1Data.email },
    update: {},
    create: {
      ...doc1Data,
      passwordHash,
      doctorProfile: {
        create: {
          specialization: 'Cardiology',
          licenseNumber: 'LIC-DOC-7721',
          department: 'Cardiology',
          availability: JSON.stringify([
            { day: 'Monday', hours: '09:00 - 17:00' },
            { day: 'Wednesday', hours: '09:00 - 17:00' },
            { day: 'Friday', hours: '09:00 - 13:00' }
          ])
        }
      }
    },
    include: { doctorProfile: true }
  });
  console.log('Doctor seeded:', doc1.email);

  const doc2Data = {
    email: 'sarah.jenkins@hms.com',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    role: 'DOCTOR',
    phone: '+1 (555) 010-0003',
    avatarUrl: null
  };
  const doc2 = await prisma.user.upsert({
    where: { email: doc2Data.email },
    update: {},
    create: {
      ...doc2Data,
      passwordHash,
      doctorProfile: {
        create: {
          specialization: 'Neurology',
          licenseNumber: 'LIC-DOC-9844',
          department: 'Neurology',
          availability: JSON.stringify([
            { day: 'Tuesday', hours: '09:00 - 17:00' },
            { day: 'Thursday', hours: '09:00 - 17:00' }
          ])
        }
      }
    },
    include: { doctorProfile: true }
  });
  console.log('Doctor seeded:', doc2.email);

  // 3. Create Nurses
  const nurse1Data = {
    email: 'emily.watson@hms.com',
    firstName: 'Emily',
    lastName: 'Watson',
    role: 'NURSE',
    phone: '+1 (555) 010-0004',
    avatarUrl: null
  };
  const nurse1 = await prisma.user.upsert({
    where: { email: nurse1Data.email },
    update: {},
    create: {
      ...nurse1Data,
      passwordHash,
      nurseProfile: {
        create: {
          department: 'Emergency & General',
          licenseNumber: 'LIC-NUR-1100'
        }
      }
    },
    include: { nurseProfile: true }
  });
  console.log('Nurse seeded:', nurse1.email);

  const nurse2Data = {
    email: 'david.miller@hms.com',
    firstName: 'David',
    lastName: 'Miller',
    role: 'NURSE',
    phone: '+1 (555) 010-0005',
    avatarUrl: null
  };
  const nurse2 = await prisma.user.upsert({
    where: { email: nurse2Data.email },
    update: {},
    create: {
      ...nurse2Data,
      passwordHash,
      nurseProfile: {
        create: {
          department: 'Intensive Care Unit (ICU)',
          licenseNumber: 'LIC-NUR-2233'
        }
      }
    },
    include: { nurseProfile: true }
  });
  console.log('Nurse seeded:', nurse2.email);

  // 4. Create Patients
  const pat1Data = {
    email: 'jane.doe@hms.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'PATIENT',
    phone: '+1 (555) 010-0006',
    avatarUrl: null
  };
  const pat1 = await prisma.user.upsert({
    where: { email: pat1Data.email },
    update: {},
    create: {
      ...pat1Data,
      passwordHash,
      patientProfile: {
        create: {
          dateOfBirth: new Date('1985-05-15'),
          gender: 'Female',
          bloodGroup: 'A+',
          address: '123 Health Ave, Medical City, MC 90210',
          emergencyContact: 'John Doe (+1 (555) 010-0099)'
        }
      }
    },
    include: { patientProfile: true }
  });
  console.log('Patient seeded:', pat1.email);

  const pat2Data = {
    email: 'mark.wilson@hms.com',
    firstName: 'Mark',
    lastName: 'Wilson',
    role: 'PATIENT',
    phone: '+1 (555) 010-0007',
    avatarUrl: null
  };
  const pat2 = await prisma.user.upsert({
    where: { email: pat2Data.email },
    update: {},
    create: {
      ...pat2Data,
      passwordHash,
      patientProfile: {
        create: {
          dateOfBirth: new Date('1992-09-22'),
          gender: 'Male',
          bloodGroup: 'O-',
          address: '456 Treatment St, Recovery District, RD 50123',
          emergencyContact: 'Mary Wilson (+1 (555) 010-0088)'
        }
      }
    },
    include: { patientProfile: true }
  });
  console.log('Patient seeded:', pat2.email);

  // Seed Patient Vitals
  if (pat1.patientProfile) {
    await prisma.vitalSign.createMany({
      data: [
        {
          patientId: pat1.patientProfile.id,
          temperature: 37.2,
          bloodPressure: '120/80',
          pulseRate: 72,
          respiratoryRate: 16,
          oxygenSat: 98,
          recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          patientId: pat1.patientProfile.id,
          temperature: 36.9,
          bloodPressure: '118/79',
          pulseRate: 74,
          respiratoryRate: 15,
          oxygenSat: 99
        }
      ]
    });
  }

  // 5. Create Beds
  const bedData = [
    { number: 'ICU-101', type: 'ICU', wardName: 'ICU - 1st Floor', status: 'AVAILABLE', pricePerDay: 150 },
    { number: 'ICU-102', type: 'ICU', wardName: 'ICU - 1st Floor', status: 'OCCUPIED', pricePerDay: 150 },
    { number: 'ICU-103', type: 'ICU', wardName: 'ICU - 1st Floor', status: 'MAINTENANCE', pricePerDay: 150 },
    
    { number: 'GEN-201', type: 'GENERAL', wardName: 'General Ward - A', status: 'AVAILABLE', pricePerDay: 40 },
    { number: 'GEN-202', type: 'GENERAL', wardName: 'General Ward - A', status: 'AVAILABLE', pricePerDay: 40 },
    { number: 'GEN-203', type: 'GENERAL', wardName: 'General Ward - A', status: 'OCCUPIED', pricePerDay: 40 },
    
    { number: 'EMR-301', type: 'EMERGENCY', wardName: 'Emergency Room', status: 'AVAILABLE', pricePerDay: 80 },
    { number: 'EMR-302', type: 'EMERGENCY', wardName: 'Emergency Room', status: 'OCCUPIED', pricePerDay: 80 },
    
    { number: 'PVT-401', type: 'PRIVATE', wardName: 'Private Wing - Floor 3', status: 'AVAILABLE', pricePerDay: 200 },
    { number: 'PVT-402', type: 'PRIVATE', wardName: 'Private Wing - Floor 3', status: 'AVAILABLE', pricePerDay: 200 }
  ];

  for (const bed of bedData) {
    await prisma.bed.upsert({
      where: { number: bed.number },
      update: {},
      create: bed
    });
  }
  console.log('Hospital Beds seeded.');

  // Create assignments for OCCUPIED beds
  const bedICU102 = await prisma.bed.findUnique({ where: { number: 'ICU-102' } });
  const bedGEN203 = await prisma.bed.findUnique({ where: { number: 'GEN-203' } });

  if (bedICU102 && pat1.patientProfile && nurse2.nurseProfile) {
    await prisma.bedAssignment.create({
      data: {
        bedId: bedICU102.id,
        patientId: pat1.patientProfile.id,
        nurseId: nurse2.nurseProfile.id,
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    });
  }

  if (bedGEN203 && pat2.patientProfile && nurse1.nurseProfile) {
    await prisma.bedAssignment.create({
      data: {
        bedId: bedGEN203.id,
        patientId: pat2.patientProfile.id,
        nurseId: nurse1.nurseProfile.id,
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // 6. Create Resources
  const resources = [
    { name: 'Ambulance A-1', type: 'Ambulance', status: 'AVAILABLE', location: 'Bay 1', quantity: 1, description: 'Rapid response trauma vehicle' },
    { name: 'Ambulance A-2', type: 'Ambulance', status: 'IN_USE', location: 'Out on call', quantity: 1, description: 'Trauma support ambulance' },
    { name: 'Oxygen Cylinder O2-10', type: 'Oxygen Cylinder', status: 'AVAILABLE', location: 'Ward Room 105', quantity: 15, description: '40L medical grade oxygen tank' },
    { name: 'Ventilator V-3', type: 'Ventilator', status: 'AVAILABLE', location: 'ICU Unit 2', quantity: 2, description: 'Advanced respiration aid' },
    { name: 'Ventilator V-4', type: 'Ventilator', status: 'MAINTENANCE', location: 'Repair Lab', quantity: 1, description: 'Requires oxygen sensor replacement' },
    { name: 'Wheelchair WC-5', type: 'Wheelchair', status: 'AVAILABLE', location: 'Main Entrance Lobby', quantity: 8, description: 'Standard passenger wheelchair' }
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: {},
      create: resource
    });
  }
  console.log('Hospital Resources/Assets seeded.');

  // 7. Create Bills
  if (pat1.patientProfile) {
    await prisma.bill.createMany({
      data: [
        {
          patientId: pat1.patientProfile.id,
          amount: 450.00,
          status: 'PENDING',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          description: 'ICU ward stay (3 days) & initial medical exam'
        },
        {
          patientId: pat1.patientProfile.id,
          amount: 120.00,
          status: 'PAID',
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          description: 'Blood panel and ECG diagnostics fee'
        }
      ]
    });
  }

  // 8. Create Sample Appointments
  if (pat1.patientProfile && doc1.doctorProfile) {
    await prisma.appointment.create({
      data: {
        patientId: pat1.patientProfile.id,
        doctorId: doc1.doctorProfile.id,
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        reason: 'Monthly cardiovascular stress monitoring follow-up',
        status: 'CONFIRMED',
        notes: 'Patient should fast for 4 hours prior'
      }
    });
  }

  if (pat2.patientProfile && doc2.doctorProfile) {
    await prisma.appointment.create({
      data: {
        patientId: pat2.patientProfile.id,
        doctorId: doc2.doctorProfile.id,
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        reason: 'Migraine frequency and light sensitivity consultations',
        status: 'PENDING'
      }
    });
  }

  console.log('DB seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
