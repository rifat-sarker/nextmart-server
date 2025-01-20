import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import { ProductController } from './product.controller';
import validateRequest from '../../middleware/validateRequest';
import { productValidation } from './product.validation';

const router = Router();

router.get('/', ProductController.getAllProduct);

router.get('/trending', ProductController.getTrendingProducts);

router.post(
   '/',
   auth(UserRole.USER),
   multerUpload.fields([{ name: 'images' }]),
   parseBody,
   validateRequest(productValidation.createProductValidationSchema),
   ProductController.createProduct
);

router.get('/:productId', ProductController.getSingleProduct);

router.patch(
   '/:productId',
   auth(UserRole.USER),
   multerUpload.fields([{ name: 'images' }]),
   parseBody,
   ProductController.updateProduct
);

router.delete('/:productId', ProductController.deleteProduct);

export const ProductRoutes = router;
