import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { io } from '../index';

// Get list of active and recent nurse calls (Nurses and Admins)
export const getNurseCalls = async (req: AuthRequest, res: Response) => {
  try {
    const calls = await prisma.nurseCall.findMany({
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        nurse: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(calls);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error loading nurse calls' });
  }
};

// Create a Nurse Call request (Patient only)
export const createNurseCall = async (req: AuthRequest, res: Response) => {
  try {
    const { bedNumber, message } = req.body;

    if (!bedNumber) {
      return res.status(400).json({ message: 'Bed number is required for dispatching calls' });
    }

    if (req.user?.role !== 'PATIENT' || !req.user.profileId) {
      return res.status(403).json({ message: 'Only registered patients can trigger nurse calls' });
    }

    const call = await prisma.nurseCall.create({
      data: {
        patientId: req.user.profileId,
        bedNumber,
        message,
        status: 'PENDING'
      },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    // Broadcast to the Nurse room
    io.to('NURSE').emit('receive_nurse_call', call);
    // Also emit globally for dashboards
    io.emit('global_notification', {
      type: 'NURSE_CALL',
      message: `Emergency Nurse Call: Bed ${bedNumber} - ${call.patient.user.firstName} ${call.patient.user.lastName}`,
      data: call
    });

    res.status(201).json({
      message: 'Nurse called successfully. Help is on the way.',
      call
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error triggering nurse call' });
  }
};

// Accept or Resolve Nurse Call (Nurse only)
export const updateNurseCallStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "RESPONDING" or "RESOLVED"

    if (status !== 'RESPONDING' && status !== 'RESOLVED') {
      return res.status(400).json({ message: 'Status must be RESPONDING or RESOLVED' });
    }

    if (req.user?.role !== 'NURSE' || !req.user.profileId) {
      return res.status(403).json({ message: 'Only nurses can respond to calls' });
    }

    const call = await prisma.nurseCall.findUnique({ where: { id } });
    if (!call) {
      return res.status(404).json({ message: 'Call request not found' });
    }

    const updatedCall = await prisma.nurseCall.update({
      where: { id },
      data: {
        status,
        nurseId: req.user.profileId
      },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        nurse: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    // Broadcast update
    io.emit('nurse_call_status_updated', updatedCall);

    res.json({
      message: `Nurse call status updated to ${status}`,
      call: updatedCall
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating nurse call' });
  }
};
