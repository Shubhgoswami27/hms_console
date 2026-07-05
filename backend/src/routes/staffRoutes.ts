import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staffController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

// Multer Local Disk Storage Setup for Avatar Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(authenticateToken);

router.get('/', requireRoles(['SUPER_ADMIN', 'DOCTOR', 'NURSE', 'PATIENT']), getAllStaff);
router.post('/', requireRoles(['SUPER_ADMIN']), upload.single('avatar'), createStaff);
router.put('/:id', requireRoles(['SUPER_ADMIN']), upload.single('avatar'), updateStaff);
router.delete('/:id', requireRoles(['SUPER_ADMIN']), deleteStaff);

export default router;
