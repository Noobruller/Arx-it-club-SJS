import { Router } from 'express';
import { certificateController } from '../controllers/certificateController.js';

const router = Router();

// Public certificate verification
router.get('/verify/:certificateId', certificateController.verify);
router.get('/:id', certificateController.getById);

export default router;