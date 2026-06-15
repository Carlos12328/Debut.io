import * as bcrypt from 'bcryptjs';
import { Usuario } from '../models/usuario';
import { UsuarioRepository } from '../../persistence/repositories';
import { supabase } from '../../lib/supabase';

export interface AuthService {
  login(
    email: string,
    senha: string
  ): Promise<Usuario>;
  logout(): Promise<void>;
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

    if (!senha.trim()) {
      throw new Error(
        'Senha é obrigatória.'
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

    const senhaValida =
      await bcrypt.compare(
        senha,
        usuario.senha_hash
      );

    if (!senhaValida) {
      throw new Error(
        'Senha incorreta.'
      );
    }

    return usuario;
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // A sessao pode ser legada (sem Supabase Auth). O estado local
      // e limpo pelo AppRoot mesmo que o signOut falhe.
      console.warn('[logout] signOut falhou:', error);
    }
  }
}
