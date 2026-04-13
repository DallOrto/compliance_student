import { IComplianceService } from '../interfaces/IComplianceService';
import { IStudentRepository } from '../interfaces/IStudentRepository';
import { IComplianceJobRepository } from '../interfaces/IComplianceJobRepository';
import { CheckComplianceDTO, ComplianceJobCreatedDTO } from '../dtos/check-compliance.dto';

export class ComplianceService implements IComplianceService {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly complianceJobRepository: IComplianceJobRepository,
  ) {}

  async check(data: CheckComplianceDTO): Promise<ComplianceJobCreatedDTO> {
    // Registra/atualiza o aluno no banco da compliance (identidade)
    const student = await this.studentRepository.upsert({
      name: data.name,
      document: data.document,
      birthDate: new Date(data.birthDate),
      schoolId: data.schoolId,
    });

    // Cria o job — a análise em si acontece depois no worker
    const job = await this.complianceJobRepository.create({
      studentId: student.id,
      callbackUrl: data.callbackUrl,
    });

    return {
      jobId: job.id,
      status: 'PROCESSING',
    };
  }
}
