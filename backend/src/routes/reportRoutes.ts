import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getReports, uploadReport } from '../controllers/reportController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

// Multer Local Disk Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticateToken);

router.get('/', getReports);
router.post('/', requireRoles(['DOCTOR']), upload.single('file'), uploadReport);

export default router;
