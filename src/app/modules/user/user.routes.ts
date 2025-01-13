import { Router } from 'express';
import { UserController } from './user.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import validateRequest from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';
import auth from '../../middleware/auth';
import { UserRole } from './user.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';

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
