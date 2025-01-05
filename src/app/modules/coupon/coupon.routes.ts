import { Router } from 'express';
import { couponController } from './coupon.controller';

const router = Router();

// Define routes
router.get('/', couponController.getAll);

export default router;
