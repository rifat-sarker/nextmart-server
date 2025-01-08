import { Router } from 'express';
import { CategoryController } from './category.controller';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import validateRequest from '../../middleware/validateRequest';
import { categoryValidation } from './category.validation';

const router = Router();

router.post(
    '/',
    auth(UserRole.ADMIN, UserRole.VENDOR),
    multerUpload.single('icon'),
    parseBody,
    validateRequest(categoryValidation.createCategoryValidationSchema),
    CategoryController.createCategory
);

export const CategoryRoutes = router;
