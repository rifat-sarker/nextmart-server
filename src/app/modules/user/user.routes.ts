import { Router } from 'express';
import { UserController } from './user.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import validateRequest from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';

const router = Router();

// Define routes
router.post('/',
    clientInfoParser,
    validateRequest(UserValidation.userValidationSchema),
    UserController.registerUser
);

export const UserRoutes = router;
