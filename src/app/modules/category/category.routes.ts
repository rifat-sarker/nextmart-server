import { Router } from 'express';
import { CategoryController } from './category.controller';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

router.post(
    '/',
    auth(UserRole.ADMIN),
    multerUpload.single('icon'),
    parseBody,
    CategoryController.createCategory
);

export const CategoryRoutes = router;
