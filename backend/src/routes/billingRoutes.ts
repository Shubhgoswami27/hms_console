import { Router } from 'express';
import { getBills, createBill, payBill } from '../controllers/billingController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getBills);
router.post('/', requireRoles(['SUPER_ADMIN', 'DOCTOR']), createBill);
router.post('/:id/pay', requireRoles(['PATIENT']), payBill);

export default router;
