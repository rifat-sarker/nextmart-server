import { Router } from 'express';
import { FlashSaleController } from './flashSale.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

router.post(
    '/',
    auth(UserRole.USER, UserRole.ADMIN),
    FlashSaleController.createFlashSale
)

export const FlashSaleRoutes = router;
