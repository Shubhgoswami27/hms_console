import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-hms-2026';

// Register User (supports creating profiles dynamically)
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      avatarUrl,
      // Patient fields
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      // Doctor fields
      specialization,
      licenseNumber,
      department,
      availability
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User inside transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          firstName,
          lastName,
          phone,
          avatarUrl: avatarUrl || null
        }
      });

      if (role === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: user.id,
            dateOfBirth: new Date(dateOfBirth || '1990-01-01'),
            gender: gender || 'Other',
            bloodGroup,
            address,
            emergencyContact
          }
        });
      } else if (role === 'DOCTOR') {
        if (!licenseNumber || !specialization || !department) {
          throw new Error('Doctor licensing and specialization details are required');
        }
        await tx.doctor.create({
          data: {
            userId: user.id,
            specialization,
            licenseNumber,
            department,
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
        if (!licenseNumber || !department) {
          throw new Error('Nurse licensing and department details are required');
        }
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
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error registering user' });
  }
};

// Login User
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true,
        nurseProfile: true
      }
    });

    if (!user) {
      const isPersonalEmail = !email.endsWith('@hms.com');
      if (isPersonalEmail) {
        return res.status(404).json({ message: "No patient account found. Please register first." });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'PATIENT' && !user.patientProfile) {
      return res.status(400).json({ message: "No patient account found. Please register first." });
    }

    let profileId: string | undefined;
    if (user.role === 'PATIENT') profileId = user.patientProfile?.id;
    else if (user.role === 'DOCTOR') profileId = user.doctorProfile?.id;
    else if (user.role === 'NURSE') profileId = user.nurseProfile?.id;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        profileId
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error logging in' });
  }
};

// Get current user profile details
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        patientProfile: {
          include: {
            vitals: { take: 5, orderBy: { recordedAt: 'desc' } }
          }
        },
        doctorProfile: true,
        nurseProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error retrieving user data' });
  }
};
