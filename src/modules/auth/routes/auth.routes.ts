import { Router } from 'express';
import prisma from '../../../lib/prisma';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';

const router = Router();

const authService = new AuthService(prisma);
const authController = new AuthController(authService);

router.post('/login', authController.login);

export default router;
