import { Student } from '@prisma-client';

export interface CreateStudentData {
  name: string;
  document: string;
  password: string;
  birthDate: Date;
  schoolId: string;
}

export interface IStudentRepository {
  upsert(data: CreateStudentData): Promise<Student>;
}
