import { Router } from 'express';
import { UserController } from './user.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import validateRequest from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';

const router = Router();

router.get(
    '/',
    UserController.getAllUser
);

router.post(
    '/',
    clientInfoParser,
    validateRequest(UserValidation.userValidationSchema),
    UserController.registerUser
);

export const UserRoutes = router;
