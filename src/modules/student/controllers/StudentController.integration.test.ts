import request from 'supertest';
import { app } from '../../../server';
import prisma from '../../../lib/prisma';

const API_KEY = 'test-api-key';
process.env.INTERNAL_API_KEY = API_KEY;

beforeEach(async () => {
  await prisma.complianceJob.deleteMany();
  await prisma.student.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /students/compliance', () => {
  const payload = {
    name: 'Maria Souza',
    document: '98765432100',
    birthDate: '2001-05-15',
    schoolId: 'escola-abc',
    callbackUrl: 'http://api1/internal/compliance-result/attempt-id',
  };

  it('deve retornar 401 quando api key não for fornecida', async () => {
    await request(app)
      .post('/students/compliance')
      .send(payload)
      .expect(401);
  });

  it('deve retornar 401 quando api key for inválida', async () => {
    await request(app)
      .post('/students/compliance')
      .set('x-api-key', 'chave-errada')
      .send(payload)
      .expect(401);
  });

  it('deve retornar 202 com jobId e status PROCESSING', async () => {
    const response = await request(app)
      .post('/students/compliance')
      .set('x-api-key', API_KEY)
      .send(payload)
      .expect(202);

    expect(typeof response.body.jobId).toBe('string');
    expect(response.body.status).toBe('PROCESSING');
  });

  it('deve criar um ComplianceJob no banco de dados', async () => {
    await request(app)
      .post('/students/compliance')
      .set('x-api-key', API_KEY)
      .send(payload)
      .expect(202);

    const jobs = await prisma.complianceJob.findMany();
    expect(jobs).toHaveLength(1);
    expect(jobs[0].callbackUrl).toBe(payload.callbackUrl);
    expect(jobs[0].status).toBe('PROCESSING');
  });

  it('deve criar o aluno no banco de dados', async () => {
    await request(app)
      .post('/students/compliance')
      .set('x-api-key', API_KEY)
      .send(payload)
      .expect(202);

    const student = await prisma.student.findFirst({ where: { document: payload.document } });
    expect(student).not.toBeNull();
    expect(student!.name).toBe('Maria Souza');
  });

  it('deve atualizar o aluno e criar novo job ao receber o mesmo document', async () => {
    await request(app)
      .post('/students/compliance')
      .set('x-api-key', API_KEY)
      .send(payload)
      .expect(202);

    const updatedPayload = { ...payload, name: 'Maria Souza Atualizada' };
    await request(app)
      .post('/students/compliance')
      .set('x-api-key', API_KEY)
      .send(updatedPayload)
      .expect(202);

    const totalStudents = await prisma.student.count();
    const totalJobs = await prisma.complianceJob.count();

    expect(totalStudents).toBe(1);
    expect(totalJobs).toBe(2);

    const student = await prisma.student.findFirst({ where: { document: payload.document } });
    expect(student!.name).toBe('Maria Souza Atualizada');
  });
});
