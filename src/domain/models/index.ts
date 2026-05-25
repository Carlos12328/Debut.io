export type EntityId = number;

export type PerfilUsuario = 'familiar' | 'cerimonialista';

export interface Usuario {
  id_usuario: EntityId;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: PerfilUsuario;
  cpf?: string;
  data_nascimento?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
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
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}
export type StatusPagamento = 'pendente' | 'pago';

export interface Pagamento {
  id_pagamento: EntityId;
  id_fornecedor: EntityId;
  valor: number;
  vencimento: string;
  status: StatusPagamento;
}

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida';
export type PrioridadeTarefa = 'alta' | 'media' | 'baixa';

export interface Tarefa {
  id_tarefa: EntityId;
  id_evento: EntityId;
  descricao: string;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  prazo?: string;
  responsavel?: string;
}

export interface Compromisso {
  id_compromisso: EntityId;
  id_evento: EntityId;
  descricao: string;
  data_compromisso: string;
}

