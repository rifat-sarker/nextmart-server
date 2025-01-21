import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

// Define routes
router.get(
    '/my-shop-orders',
    auth(UserRole.USER),
    OrderController.getMyShopOrders
);

router.post(
    '/',
    auth(UserRole.USER),
    OrderController.createOrder
)

export const OrderRoutes = router;
