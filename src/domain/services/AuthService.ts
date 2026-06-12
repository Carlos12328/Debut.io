import { Usuario } from '../models/usuario';
import { UsuarioRepository } from '../../persistence/repositories';
import { supabase } from '../../lib/supabase';

export interface AuthService {
  login(email: string, senha: string): Promise<Usuario>;
  logout(): Promise<void>;
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

  async logout(): Promise<void> {
    try { await supabase.auth.signOut(); } catch { /* sessao legada sem Supabase Auth */ }
  }
}