import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { io } from '../index';

// Get list of all hospital beds
export const getAllBeds = async (req: AuthRequest, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        assignments: {
          where: { dischargedAt: null },
          include: {
            patient: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            },
            nurse: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        }
      },
      orderBy: { number: 'asc' }
    });

    res.json(beds);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error retrieving bed information' });
  }
};

// Assign Patient to Bed (Admission)
export const assignBed = async (req: AuthRequest, res: Response) => {
  try {
    const { bedId, patientId, nurseId } = req.body;

    if (!bedId || !patientId) {
      return res.status(400).json({ message: 'Bed ID and Patient ID are required' });
    }

    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.status !== 'AVAILABLE') {
      return res.status(400).json({ message: `Bed is currently ${bed.status}` });
    }

    // Check if patient is already assigned to a bed
    const activeAssignment = await prisma.bedAssignment.findFirst({
      where: { patientId, dischargedAt: null }
    });
    if (activeAssignment) {
      return res.status(400).json({ message: 'Patient is already admitted to another bed' });
    }

    // Create assignment and update bed status in a transaction
    const assignment = await prisma.$transaction(async (tx) => {
      const createdAssignment = await tx.bedAssignment.create({
        data: {
          bedId,
          patientId,
          nurseId: nurseId || null
        },
        include: {
          bed: true,
          patient: {
            include: { user: { select: { firstName: true, lastName: true } } }
          }
        }
      });

      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' }
      });

      return createdAssignment;
    });

    // Broadcast bed update via WebSockets
    io.emit('bed_updated', {
      bedId,
      number: bed.number,
      status: 'OCCUPIED',
      assignment
    });

    res.status(201).json({
      message: 'Bed assigned successfully',
      assignment
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error assigning bed' });
  }
};

// Discharge Patient from Bed
export const dischargePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { bedId } = req.params;

    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: {
        assignments: {
          where: { dischargedAt: null }
        }
      }
    });

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.status !== 'OCCUPIED' || bed.assignments.length === 0) {
      return res.status(400).json({ message: 'Bed is not currently occupied' });
    }

    const activeAssignment = bed.assignments[0];

    // Close assignment and make bed available
    await prisma.$transaction(async (tx) => {
      await tx.bedAssignment.update({
        where: { id: activeAssignment.id },
        data: { dischargedAt: new Date() }
      });

      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'AVAILABLE' }
      });
    });

    // Broadcast update via WebSockets
    io.emit('bed_updated', {
      bedId,
      number: bed.number,
      status: 'AVAILABLE',
      assignment: null
    });

    res.json({ message: 'Patient discharged and bed is now available' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error discharging patient' });
  }
};

// Set bed maintenance status
export const updateBedStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { bedId } = req.params;
    const { status } = req.body; // "AVAILABLE" or "MAINTENANCE"

    if (status !== 'AVAILABLE' && status !== 'MAINTENANCE') {
      return res.status(400).json({ message: 'Status must be AVAILABLE or MAINTENANCE' });
    }

    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: { assignments: { where: { dischargedAt: null } } }
    });

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.status === 'OCCUPIED') {
      return res.status(400).json({ message: 'Cannot put an occupied bed into maintenance' });
    }

    const updatedBed = await prisma.bed.update({
      where: { id: bedId },
      data: { status }
    });

    // Broadcast update via WebSockets
    io.emit('bed_updated', {
      bedId: bed.id,
      number: bed.number,
      status,
      assignment: null
    });

    res.json({
      message: `Bed status updated to ${status}`,
      bed: updatedBed
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating bed status' });
  }
};
