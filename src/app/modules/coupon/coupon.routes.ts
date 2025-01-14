import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { couponController } from './coupon.controller';
import validateRequest from '../../middleware/validateRequest';
import { updateCouponValidationSchema } from './coupon.validation';

const router = Router();

// Define routes
router.post('/', auth(UserRole.ADMIN), couponController.createCoupon);

router.get('/', auth(UserRole.ADMIN), couponController.getAllCoupon);

router.patch(
   '/:couponCode/update-coupon',
   validateRequest(updateCouponValidationSchema),
   auth(UserRole.ADMIN),
   couponController.updateCoupon
);

router.get(
   '/:couponCode',
   auth(UserRole.ADMIN, UserRole.USER), // Ensure only authorized users can fetch the coupon
   couponController.getCouponById
);

export const CouponRoutes = router;
