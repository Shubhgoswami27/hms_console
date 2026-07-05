import { Router } from 'express';
import { getAllResources, updateResource, createResource } from '../controllers/resourceController';
import { authenticateToken, requireRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllResources);
router.post('/', requireRoles(['SUPER_ADMIN']), createResource);
router.put('/:id', requireRoles(['SUPER_ADMIN', 'NURSE']), updateResource);

export default router;
