import { RecuperacaoSenhaServiceImpl } from '../../../domain/services/RecuperacaoSenhaService';

export class AuthController {
  constructor(
    private readonly service:
      RecuperacaoSenhaServiceImpl
  ) {}

  async verificarEmail(
    email: string
  ): Promise<string> {
    return await this.service
      .verificarEmail(email);
  }

  validarCodigo(
    codigo: string
  ): boolean {
    return this.service
      .validarCodigo(codigo);
  }

  async redefinirSenha(
    novaSenha: string
  ): Promise<void> {
    return await this.service
      .redefinirSenha(novaSenha);
  }
}
