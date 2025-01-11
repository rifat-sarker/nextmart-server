import { Router } from 'express';
import { brandController } from './brand.controller';

const router = Router();

// Define routes
router.get('/', brandController.getAll);

export default router;
