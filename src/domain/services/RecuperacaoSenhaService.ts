import { UsuarioRepository } from '../../persistence/repositories';
import * as bcrypt from 'bcryptjs';

export class RecuperacaoSenhaServiceImpl {
  private codigoGerado:
    string | null = null;

  private emailVerificado:
    string | null = null;

  constructor(
    private readonly usuarioRepository:
    UsuarioRepository
  ) {}

  async verificarEmail(
    email: string
  ): Promise<string> {

    if (!email.trim()) {
      throw new Error(
        'E-mail é obrigatório.'
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new Error(
        'E-mail inválido.'
      );
    }

    const usuario =
      await this.usuarioRepository
        .getByEmail(email);

    if (!usuario) {
      throw new Error(
        'Usuário não encontrado.'
      );
    }

    this.emailVerificado =
      email;

    this.codigoGerado =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    return this.codigoGerado;
  }

  validarCodigo(
    codigo: string
  ): boolean {
    return (
      codigo ===
      this.codigoGerado
    );
  }

  async redefinirSenha(
    novaSenha: string
  ): Promise<void> {

    if (!this.emailVerificado) {
      throw new Error(
        'Nenhum e-mail validado.'
      );
    }

    if (!novaSenha.trim()) {
      throw new Error(
        'Senha é obrigatória.'
      );
    }

    if (novaSenha.length < 6) {
      throw new Error(
        'A senha deve ter pelo menos 6 caracteres.'
      );
    }

    const usuario =
      await this.usuarioRepository
        .getByEmail(
          this.emailVerificado
        );

    if (!usuario) {
      throw new Error(
        'Usuário não encontrado.'
      );
    }

    const salt =
      bcrypt.genSaltSync(10);

    const senha_hash =
      bcrypt.hashSync(
        novaSenha,
        salt
      );

    await this.usuarioRepository
      .update(
        usuario.id_usuario,
        {
          senha_hash
        }
      );

    console.log(
      '[MVP] senha redefinida:',
      this.emailVerificado
    );
  }
}
