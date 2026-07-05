import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';

// Ensure uploads folder exists for fallback disk storage
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary config
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Get all medical reports
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role, profileId } = req.user;
    let reports = [];

    if (role === 'PATIENT') {
      reports = await prisma.medicalReport.findMany({
        where: { patientId: profileId },
        include: {
          doctor: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'DOCTOR') {
      reports = await prisma.medicalReport.findMany({
        where: { doctorId: profileId },
        include: {
          patient: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      reports = await prisma.medicalReport.findMany({
        include: {
          patient: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          },
          doctor: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error retrieving medical reports' });
  }
};

// Upload a new report (Doctors only)
export const uploadReport = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, title, description } = req.body;
    const file = req.file;

    if (!patientId || !title) {
      return res.status(400).json({ message: 'Patient ID and report title are required' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileUrl = '';

    // Verify doctor identity
    if (req.user?.role !== 'DOCTOR' || !req.user.profileId) {
      return res.status(403).json({ message: 'Only registered Doctors can upload reports' });
    }

    // Try Cloudinary upload, fallback to local file link
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          resource_type: 'auto',
          folder: 'hms_reports'
        });
        fileUrl = uploadResult.secure_url;
        // Clean local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error('Cloudinary upload failed, falling back to local file link:', err);
        fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    }

    const report = await prisma.medicalReport.create({
      data: {
        patientId,
        doctorId: req.user.profileId,
        title,
        description,
        fileUrl
      }
    });

    res.status(201).json({
      message: 'Medical report uploaded successfully',
      report
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing report upload' });
  }
};
