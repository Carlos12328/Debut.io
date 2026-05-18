import { Usuario, PerfilUsuario } from '../models';
import { UsuarioRepository } from '../../persistence/repositories';

// ─── Auth ────────────────────────────────────────────────
export interface AuthService {
  login(email: string, senha: string): Promise<Usuario>;
}

export class AuthServiceImpl implements AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async login(email: string, senha: string): Promise<Usuario> {
    if (!email || !senha) throw new Error('E-mail e senha são obrigatórios.');
    const usuario = await this.usuarioRepository.getByEmail(email);
    if (!usuario) throw new Error('Usuário não encontrado.');
    if (usuario.senha_hash !== senha) throw new Error('Credenciais inválidas.');
    return usuario;
  }
}

// ─── Cadastro ────────────────────────────────────────────
export interface CadastroService {
  cadastrar(nome: string, email: string, senha: string, perfil: PerfilUsuario): Promise<Usuario>;
}

export class CadastroServiceImpl implements CadastroService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async cadastrar(nome: string, email: string, senha: string, perfil: PerfilUsuario): Promise<Usuario> {
    if (!nome || !email || !senha) throw new Error('Todos os campos são obrigatórios.');
    if (!email.includes('@')) throw new Error('E-mail inválido.');
    if (senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
    const existente = await this.usuarioRepository.getByEmail(email);
    if (existente) throw new Error('Já existe uma conta com este e-mail.');
    const novoUsuario = { id_usuario: 0, nome, email, senha_hash: senha, perfil };
    return await this.usuarioRepository.create(novoUsuario);
  }
}
