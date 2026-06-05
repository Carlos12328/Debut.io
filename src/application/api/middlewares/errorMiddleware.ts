export interface RespostaErro {
  sucesso: false;
  erro: string;
  codigo: number;
  timestamp: string;
}

export function tratarErro(error: any): RespostaErro {
  const mensagem = error?.message ?? 'Erro interno do servidor.';
  let codigo = 500;

  if (mensagem.includes('nao encontrado') || mensagem.includes('nao existe')) codigo = 404;
  if (mensagem.includes('obrigatorio') || mensagem.includes('invalido') || mensagem.includes('deve')) codigo = 400;
  if (mensagem.includes('autenticacao') || mensagem.includes('token') || mensagem.includes('expirado')) codigo = 401;
  if (mensagem.includes('permissao') || mensagem.includes('acesso negado')) codigo = 403;
  if (mensagem.includes('ja existe') || mensagem.includes('duplicado') || mensagem.includes('unico')) codigo = 409;

  return {
    sucesso: false,
    erro: mensagem,
    codigo,
    timestamp: new Date().toISOString(),
  };
}
