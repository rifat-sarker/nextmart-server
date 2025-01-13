import { Router } from 'express';


const router = Router();

// Define routes
router.get('/', vendorController.getAll);

export default router;
