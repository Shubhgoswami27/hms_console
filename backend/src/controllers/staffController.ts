import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary config
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Get list of all Doctors and Nurses
export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { role, department } = req.query;

    const doctorsWhere: any = {};
    const nursesWhere: any = {};

    if (department) {
      doctorsWhere.department = String(department);
      nursesWhere.department = String(department);
    }

    let doctors: any[] = [];
    let nurses: any[] = [];

    if (!role || role === 'DOCTOR') {
      doctors = await prisma.doctor.findMany({
        where: doctorsWhere,
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
          }
        }
      });
    }

    if (!role || role === 'NURSE') {
      nurses = await prisma.nurse.findMany({
        where: nursesWhere,
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
          }
        }
      });
    }

    res.json({ doctors, nurses });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching staff members' });
  }
};

// Create a new Staff Member (Super Admin Only)
export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      password,
      role, // DOCTOR or NURSE
      firstName,
      lastName,
      phone,
      department,
      licenseNumber,
      specialization, // Doctor only
      availability // Doctor only (JSON string)
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role || !department || !licenseNumber) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (role !== 'DOCTOR' && role !== 'NURSE') {
      return res.status(400).json({ message: 'Role must be DOCTOR or NURSE' });
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let avatarUrl = null;
    const file = (req as any).file;
    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            resource_type: 'auto',
            folder: 'hms_avatars'
          });
          avatarUrl = uploadResult.secure_url;
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error('Cloudinary upload failed, falling back to local file link:', err);
          avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        }
      } else {
        avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }
    }

    const newStaff = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          firstName,
          lastName,
          phone,
          avatarUrl
        }
      });

      if (role === 'DOCTOR') {
        if (!specialization) {
          throw new Error('Specialization is required for Doctors');
        }
        await tx.doctor.create({
          data: {
            userId: user.id,
            licenseNumber,
            department,
            specialization,
            availability: availability || JSON.stringify([
              { day: 'Monday', hours: '09:00 - 17:00' },
              { day: 'Tuesday', hours: '09:00 - 17:00' },
              { day: 'Wednesday', hours: '09:00 - 17:00' },
              { day: 'Thursday', hours: '09:00 - 17:00' },
              { day: 'Friday', hours: '09:00 - 17:00' }
            ])
          }
        });
      } else if (role === 'NURSE') {
        await tx.nurse.create({
          data: {
            userId: user.id,
            department,
            licenseNumber
          }
        });
      }

      return user;
    });

    res.status(201).json({
      message: 'Staff account created successfully',
      user: {
        id: newStaff.id,
        email: newStaff.email,
        role: newStaff.role,
        firstName: newStaff.firstName,
        lastName: newStaff.lastName
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating staff account' });
  }
};

// Update Staff Member Details (Super Admin Only)
export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // userId of staff member
    const {
      firstName,
      lastName,
      phone,
      department,
      licenseNumber,
      specialization,
      availability
    } = req.body;

    const staffUser = await prisma.user.findUnique({
      where: { id },
      include: { doctorProfile: true, nurseProfile: true }
    });

    if (!staffUser) {
      return res.status(404).json({ message: 'Staff member user not found' });
    }

    let avatarUrl = undefined;
    const file = (req as any).file;
    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            resource_type: 'auto',
            folder: 'hms_avatars'
          });
          avatarUrl = uploadResult.secure_url;
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error('Cloudinary upload failed, falling back to local file link:', err);
          avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        }
      } else {
        avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic details
      const user = await tx.user.update({
        where: { id },
        data: {
          firstName: firstName !== undefined ? firstName : undefined,
          lastName: lastName !== undefined ? lastName : undefined,
          phone: phone !== undefined ? phone : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
        }
      });

      if (staffUser.role === 'DOCTOR' && staffUser.doctorProfile) {
        await tx.doctor.update({
          where: { id: staffUser.doctorProfile.id },
          data: {
            department: department !== undefined ? department : undefined,
            licenseNumber: licenseNumber !== undefined ? licenseNumber : undefined,
            specialization: specialization !== undefined ? specialization : undefined,
            availability: availability !== undefined ? availability : undefined
          }
        });
      } else if (staffUser.role === 'NURSE' && staffUser.nurseProfile) {
        await tx.nurse.update({
          where: { id: staffUser.nurseProfile.id },
          data: {
            department: department !== undefined ? department : undefined,
            licenseNumber: licenseNumber !== undefined ? licenseNumber : undefined
          }
        });
      }

      return user;
    });

    res.json({
      message: 'Staff account updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating staff details' });
  }
};

// Delete Staff Member (Super Admin Only)
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // userId of staff member

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'Staff user not found' });
    }

    if (user.role !== 'DOCTOR' && user.role !== 'NURSE') {
      return res.status(400).json({ message: 'Only Doctor or Nurse accounts can be removed here' });
    }

    // Cascade delete handles profiles
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Staff member account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error removing staff account' });
  }
};
