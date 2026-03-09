import { PrismaClient, ComplianceCheck } from '@prisma-client';
import { IComplianceRepository, CreateComplianceData } from '../interfaces/IComplianceRepository';

export class ComplianceRepository implements IComplianceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateComplianceData): Promise<ComplianceCheck> {
    return this.prisma.complianceCheck.create({ data });
  }
}
