export interface CheckComplianceDTO {
  name: string;
  document: string;
  birthDate: string;
  schoolId: string;
}

export interface ComplianceResultDTO {
  complianceId: string;
  approved: boolean;
  reason: string | null;
  student: {
    id: string;
    name: string;
    document: string;
    schoolId: string;
  };
}
