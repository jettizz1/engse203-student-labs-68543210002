import { Router } from 'express';
import * as controller from '../controllers/userController.js';

const router = Router();

router.get('/', controller.listUsers);
router.get('/:id/requests', controller.listUserRequests);

export default router;
