import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

router.post('/refresh-token', AuthController.refreshToken);
router.post(
   '/changePassword',
   auth(UserRole.CUSTOMER, UserRole.VENDOR),
   AuthController.changePassword
);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export const AuthRoutes = router;
