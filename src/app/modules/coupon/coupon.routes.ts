import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { couponController } from './coupon.controller';

const router = Router();

// Define routes
router.post(
    '/',
    auth(UserRole.ADMIN),
    couponController.createCoupon
);

export const CouponRoutes = router;
