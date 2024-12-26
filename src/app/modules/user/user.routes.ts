import { Router } from 'express';
import { UserController } from './user.controller';
import clientInfoParser from '../../middleware/clientInfoParser';

const router = Router();

// Define routes
router.post('/', clientInfoParser, UserController.registerUser);

export const UserRoutes = router;
