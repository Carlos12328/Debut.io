export interface DashboardTarefaResumo { id: number; nome: string; prazoFormatado: string; }

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
}