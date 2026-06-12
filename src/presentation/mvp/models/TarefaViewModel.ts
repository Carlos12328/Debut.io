/**
 * TarefaViewModel — Debut.io
 * Localização correta: src/presentation/mvp/models/
 * UC08–UC10 | RN-003: prioridade | RN-005: histórico
 */

export type StatusTarefaLabel  = 'Pendente' | 'Em andamento' | 'Concluída';
export type PrioridadeLabel    = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface TarefaViewModel {
  id: number;
  descricao: string;
  responsavel: string;
  statusLabel: StatusTarefaLabel;
  statusCor: string;
  prioridadeLabel: PrioridadeLabel;
  prioridadeCor: string;
  prazoFormatado: string;     // "30/06/2026"
  diasParaPrazo: number;
  prazoLabel: string;         // "Prazo em 5 dias" | "Atrasada há 2 dias"
  isAtrasada: boolean;
  isHoje: boolean;
  isConcluida: boolean;
}

export interface TarefasResumoViewModel {
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  atrasadas: number;
  percentualConclusao: number;
}
