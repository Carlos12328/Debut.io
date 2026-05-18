export type EntityId = number;

export type PerfilUsuario = 'familiar' | 'cerimonialista';

export interface Usuario {
  id_usuario: EntityId;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: PerfilUsuario;
}

export type StatusEvento = 'ativo' | 'encerrado';

export interface Evento {
  id_evento: EntityId;
  id_usuario: EntityId;
  nome: string;
  data_evento: string;
  orcamento: number;
  status: StatusEvento;
}

export interface Fornecedor {
  id_fornecedor: EntityId;
  id_evento: EntityId;
  nome: string;
  tipo_servico: string;
  valor: number;
}

export type StatusPagamento = 'pendente' | 'pago';

export interface Pagamento {
  id_pagamento: EntityId;
  id_fornecedor: EntityId;
  valor: number;
  vencimento: string;
  status: StatusPagamento;
}

export type StatusTarefa = 'pendente' | 'concluida';

export interface Tarefa {
  id_tarefa: EntityId;
  id_evento: EntityId;
  descricao: string;
  status: StatusTarefa;
}

export interface Compromisso {
  id_compromisso: EntityId;
  id_evento: EntityId;
  descricao: string;
  data_compromisso: string;
}
