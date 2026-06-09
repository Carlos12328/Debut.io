/**
 * FinanceiroViewModel.ts — Debut.io
 * Localização: src/presentation/mvp/models/FinanceiroViewModel.ts
 *
 * Modelo/ViewModel do módulo financeiro.
 * Criado pelo FinanceiroPresenter — a View recebe e renderiza, sem calcular.
 *
 * UC06 — Registrar pagamento
 * UC07 — Consultar pagamentos
 * UC14 — Dashboard financeiro
 * RN-001: controle de orçamento (alertar quando exceder)
 * RN-002: controle de status de pagamento
 */

// ── Pagamento formatado (Model do Presenter → View) ───────────

export interface PagamentoFormatadoViewModel {
  id: number;
  fornecedorId: number;
  /** Nome do fornecedor — resolvido pelo Presenter */
  fornecedorNome: string;
  /** "R$ 1.500,00" — formatado pelo Presenter */
  valorFormatado: string;
  /** Valor numérico — para o Presenter calcular o resumo */
  valor: number;
  /** "15/07/2026" */
  vencimentoFormatado: string;
  /** "Pago" | "Pendente" | "Atrasado" */
  statusLabel: string;
  /** Cor semântica: '#2ecc71' pago | '#f39c12' pendente | '#e74c3c' atrasado */
  statusCor: string;
  /** "Vence em 5 dias" | "Atrasado há 3 dias" | "Pago ✓" */
  vencimentoLabel: string;
  diasParaVencimento: number;
  isAtrasado: boolean;
  isHoje: boolean;
}

// ── Resumo financeiro do evento ───────────────────────────────

export interface ResumoFinanceiroViewModel {
  /** "R$ 30.000,00" */
  orcamentoTotalFormatado: string;
  /** "R$ 12.500,00" — soma dos pagamentos com status 'pago' */
  totalGastoFormatado: string;
  /** "R$ 17.500,00" */
  saldoRestanteFormatado: string;
  /** 0–100 */
  percentualUtilizado: number;
  /** true quando gastos > orçamento (RN-001) */
  orcamentoExcedido: boolean;
  /** "R$ 500,00 acima do orçamento" | null */
  valorExcedidoFormatado: string | null;
  /** Soma dos pagamentos atrasados: "R$ 2.000,00" */
  totalAtrasadosFormatado: string;
  quantidadeAtrasados: number;
}

// ── ViewModel principal do módulo ─────────────────────────────

export interface FinanceiroViewModel {
  resumo: ResumoFinanceiroViewModel;
  pagamentos: PagamentoFormatadoViewModel[];
  isCarregando: boolean;
  erroMensagem: string | null;
  /**
   * Mensagem de alerta de orçamento (RN-001).
   * null = sem alerta. A View exibe como banner quando não null.
   */
  alertaOrcamento: string | null;
}
