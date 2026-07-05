import { Router } from 'express';
import { getNurseCalls, createNurseCall, updateNurseCallStatus } from '../controllers/nurseCallController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['SUPER_ADMIN', 'NURSE']), getNurseCalls);
router.post('/', requireRoles(['PATIENT']), createNurseCall);
router.patch('/:id', requireRoles(['NURSE']), updateNurseCallStatus);

export default router;
