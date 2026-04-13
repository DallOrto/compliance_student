import { Router } from 'express';
import prisma from '../../../lib/prisma';
import { StudentRepository } from '../repositories/StudentRepository';
import { ComplianceJobRepository } from '../repositories/ComplianceJobRepository';
import { ComplianceService } from '../services/ComplianceService';
import { StudentController } from '../controllers/StudentController';
import { apiKeyMiddleware } from '../../../middlewares/apiKeyMiddleware';

const router = Router();

const studentRepository = new StudentRepository(prisma);
const complianceJobRepository = new ComplianceJobRepository(prisma);
const complianceService = new ComplianceService(studentRepository, complianceJobRepository);
const studentController = new StudentController(complianceService);

router.post('/compliance', apiKeyMiddleware, studentController.checkCompliance);

export default router;
