import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../../server';
import prisma from '../../../lib/prisma';

beforeEach(async () => {
  await prisma.complianceCheck.deleteMany();
  await prisma.student.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function getToken(): Promise<string> {
  const hashedPassword = await bcrypt.hash('senha123', 10);

  await prisma.student.create({
    data: {
      name: 'Maria Souza',
      document: '98765432100',
      password: hashedPassword,
      birthDate: new Date('2001-05-15'),
      schoolId: 'escola-abc',
    },
  });

  const loginResponse = await request(app)
    .post('/auth/login')
    .send({ document: '98765432100', password: 'senha123' });

  return loginResponse.body.token;
}

describe('POST /students/compliance', () => {
  const payload = {
    name: 'Maria Souza',
    document: '98765432100',
    password: 'senha123',
    birthDate: '2001-05-15',
    schoolId: 'escola-abc',
  };

  it('deve retornar 401 quando token não for fornecido', async () => {
    await request(app)
      .post('/students/compliance')
      .send(payload)
      .expect(401);
  });

  it('deve retornar 401 quando token for inválido', async () => {
    await request(app)
      .post('/students/compliance')
      .set('Authorization', 'Bearer token-invalido')
      .send(payload)
      .expect(401);
  });

  it('deve retornar 200 com os dados do aluno quando autenticado', async () => {
    const token = await getToken();

    const response = await request(app)
      .post('/students/compliance')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(response.body.student.name).toBe('Maria Souza');
    expect(response.body.student.document).toBe('98765432100');
    expect(response.body.student.schoolId).toBe('escola-abc');
    expect(response.body.student.id).toBeDefined();
  });

  it('deve retornar approved como boolean e reason válido', async () => {
    const token = await getToken();

    const response = await request(app)
      .post('/students/compliance')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(typeof response.body.approved).toBe('boolean');

    if (response.body.approved) {
      expect(response.body.reason).toBeNull();
    } else {
      expect(['A', 'B', 'C']).toContain(response.body.reason);
    }
  });

  it('deve persistir o registro de compliance no banco de dados', async () => {
    const token = await getToken();

    await request(app)
      .post('/students/compliance')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    const compliances = await prisma.complianceCheck.findMany();
    expect(compliances).toHaveLength(1);
    expect(typeof compliances[0].approved).toBe('boolean');
  });

  it('deve atualizar o aluno e criar novo compliance ao receber o mesmo document', async () => {
    const token = await getToken();

    await request(app)
      .post('/students/compliance')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    const updatedPayload = { ...payload, name: 'Maria Souza Atualizada' };
    const response = await request(app)
      .post('/students/compliance')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedPayload)
      .expect(200);

    expect(response.body.student.name).toBe('Maria Souza Atualizada');

    const totalStudents = await prisma.student.count();
    const totalCompliances = await prisma.complianceCheck.count();

    expect(totalStudents).toBe(1);
    expect(totalCompliances).toBe(2);
  });
});
