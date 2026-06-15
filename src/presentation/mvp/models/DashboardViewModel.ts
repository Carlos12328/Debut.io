import { PrioridadeTarefa } from '../../../domain/models';

export interface DashboardTarefaResumo { id: number; nome: string; prazoFormatado: string; prioridade: PrioridadeTarefa; }

export interface DashboardCompromissoResumo { id: number; descricao: string; dataFormatada: string; horario: string; }

export interface DashboardViewModel {
  nomeEvento: string;
  statusEvento: string;
  dataEventoFormatada: string;
  orcamentoTotal: number;
  totalGasto: number;
  disponivel: number;
  percentualComprometido: number;
  pendenciasLabel: string;
  proximasTarefas: DashboardTarefaResumo[];
  proximosCompromissos: DashboardCompromissoResumo[];
}
