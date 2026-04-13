import { PrismaClient, ComplianceJob } from '@prisma-client';
import { IComplianceJobRepository, CreateComplianceJobData } from '../interfaces/IComplianceJobRepository';

export class ComplianceJobRepository implements IComplianceJobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateComplianceJobData): Promise<ComplianceJob> {
    return this.prisma.complianceJob.create({ data });
  }

  async findPendingOlderThan(minutes: number): Promise<ComplianceJob[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.prisma.complianceJob.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: { lte: cutoff },
      },
    });
  }

  async markDone(id: string): Promise<void> {
    await this.prisma.complianceJob.update({
      where: { id },
      data: { status: 'DONE', processedAt: new Date() },
    });
  }
}
