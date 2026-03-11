import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginDTO } from '../dtos/auth.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { document, password } = req.body as LoginDTO;

    try {
      const result = await this.authService.login(document, password);
      res.status(200).json(result);
    } catch {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  };
}
