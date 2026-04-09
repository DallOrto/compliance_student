import { PrismaClient, Student } from '@prisma-client';
import { IStudentRepository, CreateStudentData } from '../interfaces/IStudentRepository';

export class StudentRepository implements IStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: CreateStudentData): Promise<Student> {
    return this.prisma.student.upsert({
      where: { document: data.document },
      update: {
        name: data.name,
        birthDate: data.birthDate,
        schoolId: data.schoolId,
      },
      create: data,
    });
  }
}
