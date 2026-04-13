import { ComplianceService } from './ComplianceService';
import { IStudentRepository } from '../interfaces/IStudentRepository';
import { IComplianceJobRepository } from '../interfaces/IComplianceJobRepository';

const mockStudentRepository: IStudentRepository = {
  upsert: jest.fn(),
};

const mockComplianceJobRepository: IComplianceJobRepository = {
  create: jest.fn(),
  findPendingOlderThan: jest.fn(),
  markDone: jest.fn(),
};

const fakeStudent = {
  id: 'uuid-123',
  name: 'João Silva',
  document: '12345678900',
  birthDate: new Date('2000-01-01'),
  schoolId: 'school-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeJob = {
  id: 'job-uuid-456',
  studentId: 'uuid-123',
  callbackUrl: 'http://api1/internal/compliance-result/attempt-1',
  status: 'PROCESSING' as const,
  createdAt: new Date(),
  processedAt: null,
};

const baseInput = {
  name: 'João Silva',
  document: '12345678900',
  birthDate: '2000-01-01',
  schoolId: 'school-1',
  callbackUrl: 'http://api1/internal/compliance-result/attempt-1',
};

describe('ComplianceService', () => {
  let service: ComplianceService;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockStudentRepository.upsert as jest.Mock).mockResolvedValue(fakeStudent);
    (mockComplianceJobRepository.create as jest.Mock).mockResolvedValue(fakeJob);
    service = new ComplianceService(mockStudentRepository, mockComplianceJobRepository);
  });

  describe('check()', () => {
    it('deve retornar jobId e status PROCESSING', async () => {
      const result = await service.check(baseInput);

      expect(result).toEqual({
        jobId: 'job-uuid-456',
        status: 'PROCESSING',
      });
    });

    it('deve fazer upsert do aluno com os dados corretos', async () => {
      await service.check(baseInput);

      expect(mockStudentRepository.upsert).toHaveBeenCalledWith({
        name: 'João Silva',
        document: '12345678900',
        birthDate: new Date('2000-01-01'),
        schoolId: 'school-1',
      });
    });

    it('deve criar o job com o studentId retornado pelo upsert e a callbackUrl', async () => {
      await service.check(baseInput);

      expect(mockComplianceJobRepository.create).toHaveBeenCalledWith({
        studentId: 'uuid-123',
        callbackUrl: 'http://api1/internal/compliance-result/attempt-1',
      });
    });

    it('deve chamar upsert e create exatamente uma vez', async () => {
      await service.check(baseInput);

      expect(mockStudentRepository.upsert).toHaveBeenCalledTimes(1);
      expect(mockComplianceJobRepository.create).toHaveBeenCalledTimes(1);
    });

    it('não deve executar lógica de aprovação/reprovação (responsabilidade do worker)', async () => {
      // O ComplianceService apenas registra o job e retorna imediatamente.
      // Não há Math.random aqui — isso foi movido para o complianceWorker.
      const randomSpy = jest.spyOn(Math, 'random');

      await service.check(baseInput);

      expect(randomSpy).not.toHaveBeenCalled();
    });
  });
});
