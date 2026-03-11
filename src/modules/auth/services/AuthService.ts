import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma-client';
import { LoginResultDTO } from '../dtos/auth.dto';

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async login(document: string, password: string): Promise<LoginResultDTO> {
    const student = await this.prisma.student.findUnique({ where: { document } });

    if (!student) {
      throw new Error('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { sub: student.id, document: student.document },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    return { token };
  }
}
