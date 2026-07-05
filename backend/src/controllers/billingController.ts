import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// Fetch patient bills (Patients see their own, Admins see all)
export const getBills = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role, profileId } = req.user;
    let bills = [];

    if (role === 'PATIENT') {
      bills = await prisma.bill.findMany({
        where: { patientId: profileId },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      bills = await prisma.bill.findMany({
        include: {
          patient: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching bills' });
  }
};

// Create a new patient bill (Admins & Doctors)
export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, amount, dueDate, description } = req.body;

    if (!patientId || amount === undefined || !dueDate || !description) {
      return res.status(400).json({ message: 'Patient, amount, due date, and details are required' });
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const bill = await prisma.bill.create({
      data: {
        patientId,
        amount: parseFloat(amount),
        status: 'PENDING',
        dueDate: new Date(dueDate),
        description
      }
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      bill
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating invoice' });
  }
};

// Pay a patient bill (Simulated Checkout)
export const payBill = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: { select: { email: true } }
          }
        }
      }
    });

    if (!bill) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // RBAC: Patients can only pay their own bills
    if (req.user?.role === 'PATIENT' && bill.patientId !== req.user.profileId) {
      return res.status(403).json({ message: 'Access denied: cannot pay another patient\'s invoice' });
    }

    const updated = await prisma.bill.update({
      where: { id },
      data: { status: 'PAID' }
    });

    res.json({
      message: 'Payment processed successfully (Simulated)',
      bill: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing payment' });
  }
};
