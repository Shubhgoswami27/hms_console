import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// Fetch appointments filtered by user role
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role, profileId } = req.user;
    let appointments = [];

    if (role === 'PATIENT') {
      appointments = await prisma.appointment.findMany({
        where: { patientId: profileId },
        include: {
          doctor: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true, phone: true }
              }
            }
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    } else if (role === 'DOCTOR') {
      appointments = await prisma.appointment.findMany({
        where: { doctorId: profileId },
        include: {
          patient: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true, phone: true }
              }
            }
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    } else {
      // Super Admin and Nurse view all appointments
      appointments = await prisma.appointment.findMany({
        include: {
          patient: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          doctor: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    }

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching appointments' });
  }
};

// Create a new Appointment (Patient or Super Admin)
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, dateTime, reason } = req.body;

    if (!doctorId || !dateTime || !reason) {
      return res.status(400).json({ message: 'Doctor, appointment date/time, and reason are required' });
    }

    // Determine target patient
    let targetPatientId = patientId;
    if (req.user?.role === 'PATIENT') {
      targetPatientId = req.user.profileId;
    }

    if (!targetPatientId) {
      return res.status(400).json({ message: 'Patient profile reference is missing' });
    }

    // Verify patient and doctor exist
    const patientExists = await prisma.patient.findUnique({ where: { id: targetPatientId } });
    const doctorExists = await prisma.doctor.findUnique({ where: { id: doctorId } });

    if (!patientExists || !doctorExists) {
      return res.status(404).json({ message: 'Specified Doctor or Patient not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: targetPatientId,
        doctorId,
        dateTime: new Date(dateTime),
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Appointment request created successfully',
      appointment
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error scheduling appointment' });
  }
};

// Update Appointment Status (Doctor or Admin)
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // RBAC: Doctors can only update their own appointments
    if (req.user?.role === 'DOCTOR' && appointment.doctorId !== req.user.profileId) {
      return res.status(403).json({ message: 'Access denied: this is not your appointment' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });

    res.json({
      message: `Appointment updated successfully to status: ${updated.status}`,
      appointment: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating appointment' });
  }
};
