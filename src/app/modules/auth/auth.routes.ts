import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

router.post('/refreshToken', AuthController.refreshToken);
router.post(
   '/changePassword',
   auth(UserRole.CUSTOMER, UserRole.VENDOR),
   AuthController.changePassword
);

router.post('/forgotPassword', AuthController.forgotPassword);
router.post('/resetPassword', AuthController.resetPassword);

export const AuthRoutes = router;
