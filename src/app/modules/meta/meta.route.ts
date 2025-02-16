import { Router } from 'express';
import { MetaController } from './meta.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

router.get(
    '/',
    auth(UserRole.ADMIN),
    MetaController.getMetaData
);
router.get('/orders', MetaController.getOrdersByDate);

export const MetaRoutes = router;
