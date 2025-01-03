import { Router } from 'express';
import { vendorController } from './vendor.controller';

const router = Router();

// Define routes
router.get('/', vendorController.getAll);

export default router;
