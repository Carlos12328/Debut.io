/**
 * LoginViewModel — Debut.io
 * Localização correta: src/presentation/mvp/models/
 * UC16 — Realizar login
 */

export type PerfilUsuario = 'Familiar' | 'Cerimonialista';

export interface UsuarioAutenticadoViewModel {
  id: number;
  nomeExibicao: string;
  iniciais: string;
  perfil: PerfilUsuario;
  email: string;
  eventoAtivoId: number | null;
}

export interface LoginFormViewModel {
  isCarregando: boolean;
  erroMensagem: string | null;
  autenticado: boolean;
}

export interface LoginViewModel {
  form: LoginFormViewModel;
  usuario: UsuarioAutenticadoViewModel | null;
}
