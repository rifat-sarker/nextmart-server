import { Router } from 'express';
import { SSLController } from './sslcommerz.controller';

const router = Router();

// Define routes
// router.get('/', orderController.getAll);

router.post(
    '/ipn',
    SSLController.validatePaymentService
)

export const SSLRoutes = router;
