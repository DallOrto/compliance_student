import { ComplianceCheck } from '@prisma-client';

export interface CreateComplianceData {
  studentId: string;
  approved: boolean;
  reason: string | null;
}

export interface IComplianceRepository {
  create(data: CreateComplianceData): Promise<ComplianceCheck>;
}
