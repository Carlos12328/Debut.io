import { Usuario } from '../models/usuario';
import { UsuarioRepository } from '../../persistence/repositories';

export interface AuthService {
  login(email: string, senha: string): Promise<Usuario>;
}

export class AuthServiceImpl implements AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async login(email: string, senha: string): Promise<Usuario> {
    if (!email || !senha) throw new Error('E-mail e senha sao obrigatorios.');
    const usuario = await this.usuarioRepository.getByEmail(email);
    if (!usuario) throw new Error('Usuario nao encontrado.');
    if (usuario.senha_hash !== senha) throw new Error('Credenciais invalidas.');
    return usuario;
  }
}
