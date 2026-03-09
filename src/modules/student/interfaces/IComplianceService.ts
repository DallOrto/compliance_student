import { CheckComplianceDTO, ComplianceResultDTO } from '../dtos/check-compliance.dto';

export interface IComplianceService {
  check(data: CheckComplianceDTO): Promise<ComplianceResultDTO>;
}
