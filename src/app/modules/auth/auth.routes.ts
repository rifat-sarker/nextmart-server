import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import authGuard from '../../middleware/authGuard';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

router.post('/refreshToken', AuthController.refreshToken);
router.post(
   '/changePassword',
   authGuard('customer', 'vendor'),
   AuthController.changePassword
);

router.post('/forgotPassword', AuthController.forgotPassword);

export const AuthRoutes = router;
