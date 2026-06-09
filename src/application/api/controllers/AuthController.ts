import { RecuperacaoSenhaServiceImpl } from '../../../domain/services/RecuperacaoSenhaService';

export class AuthController {
  private service: RecuperacaoSenhaServiceImpl;

  constructor() {
    this.service = new RecuperacaoSenhaServiceImpl();
  }

  async verificarEmail(email: string): Promise<void> {
    return await this.service.verificarEmail(email);
  }

  async redefinirSenha(novaSenha: string): Promise<void> {
    return await this.service.redefinirSenha(novaSenha);
  }
}