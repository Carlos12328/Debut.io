/**
 * CadastroViewModel — Debut.io
 * Localização correta: src/presentation/mvp/models/
 */

import type { PerfilUsuario } from './LoginViewModel';

export interface CadastroFormViewModel {
  isCarregando: boolean;
  sucesso: boolean;
  erroMensagem: string | null;
  errosCampos: {
    nome?: string;
    email?: string;
    senha?: string;
    confirmarSenha?: string;
    perfil?: string;
  };
}

export interface UsuarioCadastradoViewModel {
  id: number;
  nomeExibicao: string;
  email: string;
  perfil: PerfilUsuario;
  dataCadastroFormatada: string;
}

export interface CadastroViewModel {
  form: CadastroFormViewModel;
  usuarioCriado: UsuarioCadastradoViewModel | null;
}
