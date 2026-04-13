import { ComplianceJob } from '@prisma-client';

export interface CreateComplianceJobData {
  studentId: string;
  callbackUrl: string;
}

export interface IComplianceJobRepository {
  create(data: CreateComplianceJobData): Promise<ComplianceJob>;
  findPendingOlderThan(minutes: number): Promise<ComplianceJob[]>;
  markDone(id: string): Promise<void>;
}
