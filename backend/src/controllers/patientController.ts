import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// Get list of all patients (Admins, Doctors, Nurses)
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { search, bloodGroup } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
          { email: { contains: String(search) } }
        ]
      };
    }

    if (bloodGroup) {
      whereClause.bloodGroup = String(bloodGroup);
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true
          }
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });

    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching patients list' });
  }
};

// Get a patient detailed profile (EHR)
export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // RBAC check: Patient can only view their own profile
    if (req.user?.role === 'PATIENT' && req.user.profileId !== id) {
      return res.status(403).json({ message: 'Access denied: cannot view other patient files' });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true
          }
        },
        vitals: {
          orderBy: { recordedAt: 'desc' }
        },
        appointments: {
          include: {
            doctor: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          orderBy: { dateTime: 'desc' }
        },
        bedAssignments: {
          include: {
            bed: true,
            nurse: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          orderBy: { assignedAt: 'desc' }
        },
        bills: {
          orderBy: { createdAt: 'desc' }
        },
        medicalReports: {
          include: {
            doctor: {
              include: {
                user: { select: { firstName: true, lastName: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error retrieving patient details' });
  }
};

// Record patient vital signs (Doctors and Nurses)
export const recordVitals = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // patientId
    const { temperature, bloodPressure, pulseRate, respiratoryRate, oxygenSat } = req.body;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const vitals = await prisma.vitalSign.create({
      data: {
        patientId: id,
        temperature: temperature ? parseFloat(temperature) : null,
        bloodPressure,
        pulseRate: pulseRate ? parseInt(pulseRate) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        oxygenSat: oxygenSat ? parseInt(oxygenSat) : null
      }
    });

    res.status(201).json({
      message: 'Patient vital signs recorded successfully',
      vitals
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error recording patient vitals' });
  }
};
