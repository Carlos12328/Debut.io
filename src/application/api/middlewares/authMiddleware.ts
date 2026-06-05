export interface AuthPayload {
  id_usuario: number;
  email: string;
  perfil: 'familiar' | 'cerimonialista';
}

export function validarAutenticacao(token: string | undefined): AuthPayload {
  if (!token) throw new Error('Token de autenticacao nao fornecido.');
  if (!token.startsWith('Bearer ')) throw new Error('Formato de token invalido.');
  const tokenLimpo = token.replace('Bearer ', '');
  if (!tokenLimpo || tokenLimpo.length < 10) throw new Error('Token invalido ou expirado.');
  return {
    id_usuario: 0,
    email: '',
    perfil: 'familiar',
  };
}

export function verificarPerfil(
  payload: AuthPayload,
  perfisPermitidos: Array<'familiar' | 'cerimonialista'>
): boolean {
  return perfisPermitidos.includes(payload.perfil);
}
