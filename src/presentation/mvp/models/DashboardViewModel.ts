/**
 * DashboardViewModel.ts — Debut.io
 * src/presentation/mvp/models/DashboardViewModel.ts
 *
 * Modelo do Dashboard — dados de TODOS os módulos agregados e formatados.
 * O DashboardPresenter calcula tudo — a View só renderiza.
 *
 * UC14 — Dashboard financeiro | UC15 — Visão geral do evento
 */

export interface ResumoFinanceiroDashboard {
  orcamento: string;        // "R$ 30.000,00"
  totalGasto: string;       // "R$ 12.500,00"
  saldo: string;            // "R$ 17.500,00"
  percentual: number;       // 41.67
  excedido: boolean;
  atrasados: number;
  totalAtrasado: string;    // "R$ 2.000,00"
}

export interface ResumoTarefasDashboard {
  total: number;
  concluidas: number;
  pendentes: number;
  atrasadas: number;
  percentual: number;       // 0-100
}

export interface CompromissoDashboardItem {
  id: number;
  descricao: string;
  dataFormatada: string;    // "30/06/2026"
  diasLabel: string;        // "Em 5 dias" | "Hoje!" | "Passou há 2 dias"
  cor: string;
  isHoje: boolean;
}

export interface TarefaDashboardItem {
  id: number;
  descricao: string;
  prioridade: string;
  prioridadeCor: string;
  prazoLabel: string;
  isAtrasada: boolean;
}

export interface AlertaDashboard {
  id: string;
  tipo: 'urgente' | 'aviso' | 'info';
  mensagem: string;
  cor: string;
}

export interface DashboardViewModel {
  eventoNome: string;
  contagemRegressiva: string;    // "Faltam 142 dias! 🎉"
  resumoFinanceiro: ResumoFinanceiroDashboard;
  resumoTarefas: ResumoTarefasDashboard;
  proximosCompromissos: CompromissoDashboardItem[];  // próximos 5
  tarefasUrgentes: TarefaDashboardItem[];            // atrasadas/alta prioridade, máx 5
  totalFornecedores: number;
  alertas: AlertaDashboard[];
  isCarregando: boolean;
  erroMensagem: string | null;
}
