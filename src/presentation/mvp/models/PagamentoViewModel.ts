/**
 * PagamentoViewModel — Debut.io
 * Localização correta: src/presentation/mvp/models/
 *
 * UC06 — Registrar pagamento | UC07 — Consultar pagamentos
 * RN-001: controle de orçamento | RN-002: status de pagamento
 *
 * O PagamentoPresenter existente usa Pagamento (entidade bruta).
 * Este ViewModel é o dado TRANSFORMADO e FORMATADO para a View.
 * O Presenter deve chamar os formatadores de src/lib/formatters.ts
 * e retornar PagamentoViewModel, não Pagamento.
 */

export type StatusPagamentoLabel = 'Pago' | 'A vencer' | 'Atrasado' | 'Pendente';

export interface PagamentoViewModel {
  id: number;
  fornecedorId: number;
  fornecedorNome: string;     // resolvido via join/lookup
  valorFormatado: string;     // "R$ 1.500,00"
  valor: number;              // numérico para cálculos internos
  vencimentoFormatado: string;// "15/07/2026"
  statusLabel: StatusPagamentoLabel;
  statusCor: string;          // cor semântica do status
  diasParaVencimento: number; // negativo = atrasado
  vencimentoLabel: string;    // "Vence em 5 dias" | "Atrasado há 3 dias"
  isAtrasado: boolean;
  isHoje: boolean;
}
