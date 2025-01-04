import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import { ProductControler } from './product.controller';

const router = Router();

router.post(
    '/',
    auth(UserRole.VENDOR),
    multerUpload.fields([{ name: 'images' }]),
    parseBody,
    ProductControler.createProduct
);

export const ProductRoutes = router;
