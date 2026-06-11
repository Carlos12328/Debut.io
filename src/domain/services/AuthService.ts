import * as bcrypt from 'bcryptjs';
import { Usuario } from '../models/usuario';
import { UsuarioRepository } from '../../persistence/repositories';

export interface AuthService {
  login(email: string, senha: string): Promise<Usuario>;
}

export class AuthServiceImpl
implements AuthService {

  constructor(
    private readonly usuarioRepository:
    UsuarioRepository
  ) {}

  async login(
    email: string,
    senha: string
  ): Promise<Usuario> {

    if (!email || !senha) {
      throw new Error(
        'E-mail e senha são obrigatórios.'
      );
    }

    const usuario =
      await this.usuarioRepository
        .getByEmail(email);

    if (!usuario) {
      throw new Error(
        'E-mail ou senha inválidos.'
      );
    }

    const senhaValida =
      await bcrypt.compare(
        senha,
        usuario.senha_hash
      );

    if (!senhaValida) {
      throw new Error(
        'E-mail ou senha inválidos.'
      );
    }

    return usuario;
  }
}