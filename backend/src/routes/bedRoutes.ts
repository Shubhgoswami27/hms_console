import { Router } from 'express';
import { getAllBeds, assignBed, dischargePatient, updateBedStatus } from '../controllers/bedController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllBeds);
router.post('/assign', requireRoles(['SUPER_ADMIN', 'DOCTOR', 'NURSE']), assignBed);
router.post('/discharge/:bedId', requireRoles(['SUPER_ADMIN', 'DOCTOR', 'NURSE']), dischargePatient);
router.patch('/:bedId/status', requireRoles(['SUPER_ADMIN', 'NURSE']), updateBedStatus);

export default router;
