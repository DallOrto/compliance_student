import { ComplianceService } from './ComplianceService';
import { IStudentRepository } from '../interfaces/IStudentRepository';
import { IComplianceRepository } from '../interfaces/IComplianceRepository';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

const mockStudentRepository: IStudentRepository = {
  upsert: jest.fn(),
};

const mockComplianceRepository: IComplianceRepository = {
  create: jest.fn(),
};

const fakeStudent = {
  id: 'uuid-123',
  name: 'João Silva',
  document: '12345678900',
  password: 'hashed',
  birthDate: new Date('2000-01-01'),
  schoolId: 'school-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ComplianceService', () => {
  let service: ComplianceService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    service = new ComplianceService(mockStudentRepository, mockComplianceRepository);
  });

  describe('check()', () => {
    it('deve retornar os dados do aluno no resultado', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
      (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
        id: 'uuid-456', studentId: 'uuid-123', approved: true, reason: null, createdAt: new Date(),
      });

      const result = await service.check({
        name: 'João Silva',
        document: '12345678900',
        password: '123456',
        birthDate: '2000-01-01',
        schoolId: 'school-1',
      });

      expect(result.student.id).toBe('uuid-123');
      expect(result.student.name).toBe('João Silva');
      expect(result.student.document).toBe('12345678900');
      expect(result.student.schoolId).toBe('school-1');
    });

    it('deve converter birthDate string para Date ao chamar upsert', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
      (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
        id: 'uuid-456', studentId: 'uuid-123', approved: true, reason: null, createdAt: new Date(),
      });

      await service.check({
        name: 'João Silva',
        document: '12345678900',
        password: '123456',
        birthDate: '2000-01-01',
        schoolId: 'school-1',
      });

      expect(mockStudentRepository.upsert).toHaveBeenCalledWith({
        name: 'João Silva',
        document: '12345678900',
        password: 'hashed-password',
        birthDate: new Date('2000-01-01'),
        schoolId: 'school-1',
      });
    });

    it('deve criar o compliance com o studentId retornado pelo upsert', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
      (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
        id: 'uuid-456', studentId: 'uuid-123', approved: true, reason: null, createdAt: new Date(),
      });

      await service.check({
        name: 'João Silva',
        document: '12345678900',
        password: '123456',
        birthDate: '2000-01-01',
        schoolId: 'school-1',
      });

      expect(mockComplianceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'uuid-123' }),
      );
    });

    it('deve chamar upsert e create exatamente uma vez por check', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
      (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
        id: 'uuid-456', studentId: 'uuid-123', approved: true, reason: null, createdAt: new Date(),
      });

      await service.check({
        name: 'João Silva',
        document: '12345678900',
        password: '123456',
        birthDate: '2000-01-01',
        schoolId: 'school-1',
      });

      expect(mockStudentRepository.upsert).toHaveBeenCalledTimes(1);
      expect(mockComplianceRepository.create).toHaveBeenCalledTimes(1);
    });

    describe('regra de aprovação (33% de chance)', () => {
      it('deve aprovar quando Math.random() < 1/3', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
        (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
        (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
          id: 'uuid-456', studentId: 'uuid-123', approved: true, reason: null, createdAt: new Date(),
        });

        await service.check({
          name: 'João Silva', document: '12345678900', password: '123456', birthDate: '2000-01-01', schoolId: 'school-1',
        });

        expect(mockComplianceRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ approved: true, reason: null }),
        );
      });

      it('deve reprovar quando Math.random() >= 1/3', async () => {
        jest.spyOn(Math, 'random')
          .mockReturnValueOnce(0.5)
          .mockReturnValueOnce(0);
        (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
        (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
          id: 'uuid-456', studentId: 'uuid-123', approved: false, reason: 'A', createdAt: new Date(),
        });

        await service.check({
          name: 'João Silva', document: '12345678900', password: '123456', birthDate: '2000-01-01', schoolId: 'school-1',
        });

        expect(mockComplianceRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ approved: false }),
        );
      });
    });

    describe('motivo de recusa', () => {
      beforeEach(() => {
        (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
      });

      it('deve definir motivo "A" quando sorteio cai no índice 0', async () => {
        jest.spyOn(Math, 'random')
          .mockReturnValueOnce(0.5)
          .mockReturnValueOnce(0.0);
        (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
          id: 'uuid-456', studentId: 'uuid-123', approved: false, reason: 'A', createdAt: new Date(),
        });

        await service.check({
          name: 'João Silva', document: '12345678900', password: '123456', birthDate: '2000-01-01', schoolId: 'school-1',
        });

        expect(mockComplianceRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ approved: false, reason: 'A' }),
        );
      });

      it('deve definir motivo "B" quando sorteio cai no índice 1', async () => {
        jest.spyOn(Math, 'random')
          .mockReturnValueOnce(0.5)
          .mockReturnValueOnce(0.34);
        (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
          id: 'uuid-456', studentId: 'uuid-123', approved: false, reason: 'B', createdAt: new Date(),
        });

        await service.check({
          name: 'João Silva', document: '12345678900', password: '123456', birthDate: '2000-01-01', schoolId: 'school-1',
        });

        expect(mockComplianceRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ approved: false, reason: 'B' }),
        );
      });

      it('deve definir motivo "C" quando sorteio cai no índice 2', async () => {
        jest.spyOn(Math, 'random')
          .mockReturnValueOnce(0.5)
          .mockReturnValueOnce(0.67);
        (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
          id: 'uuid-456', studentId: 'uuid-123', approved: false, reason: 'C', createdAt: new Date(),
        });

        await service.check({
          name: 'João Silva', document: '12345678900', password: '123456', birthDate: '2000-01-01', schoolId: 'school-1',
        });

        expect(mockComplianceRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ approved: false, reason: 'C' }),
        );
      });

      it('não deve definir motivo quando aprovado', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
        (mockComplianceRepository.create as jest.Mock).mockResolvedValue({
          id: 'uuid-456', studentId: 'uuid-123', approved: true, reason: null, createdAt: new Date(),
        });

        await service.check({
          name: 'João Silva', document: '12345678900', password: '123456', birthDate: '2000-01-01', schoolId: 'school-1',
        });

        expect(mockComplianceRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ approved: true, reason: null }),
        );
        expect(Math.random).toHaveBeenCalledTimes(1);
      });
    });
  });
});
