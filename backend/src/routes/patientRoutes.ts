import { Router } from 'express';
import { getAllPatients, getPatientById, recordVitals } from '../controllers/patientController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

// Protect all routes with JWT check
router.use(authenticateToken);

router.get('/', requireRoles(['SUPER_ADMIN', 'DOCTOR', 'NURSE']), getAllPatients);
router.get('/:id', getPatientById);
router.post('/:id/vitals', requireRoles(['SUPER_ADMIN', 'DOCTOR', 'NURSE']), recordVitals);

export default router;
