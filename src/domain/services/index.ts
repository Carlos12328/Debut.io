import { Usuario } from '../models';

// Interface do serviço de autenticação
export interface AuthService {
  login(email: string, senha: string): Promise<Usuario>;
}

// Implementação do serviço
export class AuthServiceImpl implements AuthService {
  constructor(private readonly usuarioRepository: import('../../persistence/repositories').UsuarioRepository) {}

  async login(email: string, senha: string): Promise<Usuario> {
    if (!email || !senha) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const usuario = await this.usuarioRepository.getByEmail(email);

    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    // Comparação simples por enquanto (sem bcrypt ainda, mas preparado para ele)
    if (usuario.senha_hash !== senha) {
      throw new Error('Credenciais inválidas.');
    }

    return usuario;
  }
}