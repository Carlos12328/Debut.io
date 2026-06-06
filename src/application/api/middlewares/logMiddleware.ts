export type NivelLog = 'INFO' | 'AVISO' | 'ERRO';

export interface EntradaLog {
  nivel: NivelLog;
  modulo: string;
  acao: string;
  mensagem: string;
  timestamp: string;
  dados?: any;
}

export function registrarLog(
  nivel: NivelLog,
  modulo: string,
  acao: string,
  mensagem: string,
  dados?: any
): void {
  const entrada: EntradaLog = {
    nivel,
    modulo,
    acao,
    mensagem,
    timestamp: new Date().toISOString(),
    dados,
  };
  if (nivel === 'ERRO') {
    console.error(`[${entrada.timestamp}] [${nivel}] [${modulo}] ${acao}: ${mensagem}`, dados ?? '');
  } else if (nivel === 'AVISO') {
    console.warn(`[${entrada.timestamp}] [${nivel}] [${modulo}] ${acao}: ${mensagem}`, dados ?? '');
  } else {
    console.log(`[${entrada.timestamp}] [${nivel}] [${modulo}] ${acao}: ${mensagem}`, dados ?? '');
  }
}

export function logSucesso(modulo: string, acao: string, dados?: any): void {
  registrarLog('INFO', modulo, acao, 'Operacao concluida com sucesso.', dados);
}

export function logErro(modulo: string, acao: string, erro: any): void {
  registrarLog('ERRO', modulo, acao, erro?.message ?? 'Erro desconhecido.', erro);
}

export function logAviso(modulo: string, acao: string, mensagem: string): void {
  registrarLog('AVISO', modulo, acao, mensagem);
}
