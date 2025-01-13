import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { ShopController } from './shop.controller';
import { parseBody } from '../../middleware/bodyParser';
import { multerUpload } from '../../config/multer.config';


const router = Router();

router.post(
    '/',
    auth(UserRole.USER),
    multerUpload.single('logo'),
    parseBody,
    ShopController.createShop
)

export const ShopRoutes = router;
