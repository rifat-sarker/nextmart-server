import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import { ProductControler } from './product.controller';
import validateRequest from '../../middleware/validateRequest';
import { productValidation } from './product.validation';

const router = Router();

router.get(
    '/',
    ProductControler.getAllProduct
)

router.get(
    '/trending',
    ProductControler.getTrendingProducts
)

router.post(
    '/',
    auth(UserRole.VENDOR),
    multerUpload.fields([{ name: 'images' }]),
    parseBody,
    validateRequest(productValidation.createProductValidationSchema),
    ProductControler.createProduct
);

export const ProductRoutes = router;
