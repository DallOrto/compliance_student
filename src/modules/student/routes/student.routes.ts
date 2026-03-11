import { Router } from 'express';
import prisma from '../../../lib/prisma';
import { StudentRepository } from '../repositories/StudentRepository';
import { ComplianceRepository } from '../repositories/ComplianceRepository';
import { ComplianceService } from '../services/ComplianceService';
import { StudentController } from '../controllers/StudentController';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();

const studentRepository = new StudentRepository(prisma);
const complianceRepository = new ComplianceRepository(prisma);
const complianceService = new ComplianceService(studentRepository, complianceRepository);
const studentController = new StudentController(complianceService);

router.post('/compliance', authMiddleware, studentController.checkCompliance);

export default router;
