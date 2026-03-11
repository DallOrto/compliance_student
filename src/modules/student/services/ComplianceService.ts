import bcrypt from 'bcrypt';
import { IComplianceService } from '../interfaces/IComplianceService';
import { IStudentRepository } from '../interfaces/IStudentRepository';
import { IComplianceRepository } from '../interfaces/IComplianceRepository';
import { CheckComplianceDTO, ComplianceResultDTO } from '../dtos/check-compliance.dto';

export class ComplianceService implements IComplianceService {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly complianceRepository: IComplianceRepository,
  ) {}

  async check(data: CheckComplianceDTO): Promise<ComplianceResultDTO> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const student = await this.studentRepository.upsert({
      name: data.name,
      document: data.document,
      password: hashedPassword,
      birthDate: new Date(data.birthDate),
      schoolId: data.schoolId,
    });

    const approved = Math.random() < 1 / 3;
    const reason = approved ? null : (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)];

    const complianceCheck = await this.complianceRepository.create({
      studentId: student.id,
      approved,
      reason,
    });

    return {
      approved: complianceCheck.approved,
      reason: complianceCheck.reason,
      student: {
        id: student.id,
        name: student.name,
        document: student.document,
        schoolId: student.schoolId,
      },
    };
  }
}
