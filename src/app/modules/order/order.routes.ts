import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

// Define routes
// router.get('/', orderController.getAll);

router.post(
    '/',
    auth(UserRole.CUSTOMER),
    OrderController.createOrder
)

export const OrderRoutes = router;
