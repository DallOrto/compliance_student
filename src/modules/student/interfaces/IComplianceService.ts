import { CheckComplianceDTO, ComplianceJobCreatedDTO } from '../dtos/check-compliance.dto';

export interface IComplianceService {
  check(data: CheckComplianceDTO): Promise<ComplianceJobCreatedDTO>;
}
