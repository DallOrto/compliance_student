export interface CheckComplianceDTO {
  name: string;
  document: string;
  password: string;
  birthDate: string;
  schoolId: string;
}

export interface ComplianceResultDTO {
  approved: boolean;
  reason: string | null;
  student: {
    id: string;
    name: string;
    document: string;
    schoolId: string;
  };
}
