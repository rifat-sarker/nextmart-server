import { Router } from 'express';
import { MetaController } from './meta.controller';

const router = Router();

router.get('/', MetaController.getMetaData);
router.get('/orders', MetaController.getOrdersByDate);
router.get('/customers', MetaController.getCustomerMetaData);
router.get('/aov', MetaController.getAOVOverTime);

export const MetaRoutes = router;
