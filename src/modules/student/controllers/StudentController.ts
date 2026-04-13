import { Request, Response } from 'express';
import { IComplianceService } from '../interfaces/IComplianceService';
import { CheckComplianceDTO } from '../dtos/check-compliance.dto';

export class StudentController {
  constructor(private readonly complianceService: IComplianceService) {}

  checkCompliance = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CheckComplianceDTO;
    const result = await this.complianceService.check(body);
    res.status(202).json(result);
  };
}
