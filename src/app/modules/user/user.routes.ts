import { Router } from 'express';
import { UserController } from './user.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import validateRequest from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';
import auth from '../../middleware/auth';
import { UserRole } from './user.interface';

const router = Router();

router.get(
    '/',
    auth(UserRole.ADMIN),
    UserController.getAllUser
);

router.post(
    '/',
    clientInfoParser,
    validateRequest(UserValidation.userValidationSchema),
    UserController.registerUser
);

export const UserRoutes = router;
