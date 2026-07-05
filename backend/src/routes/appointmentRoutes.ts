import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id', updateAppointmentStatus);

export default router;
