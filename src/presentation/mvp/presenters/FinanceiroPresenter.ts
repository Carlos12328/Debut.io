/**
 * FinanceiroPresenter.ts — Debut.io
 * src/presentation/mvp/presenters/FinanceiroPresenter.ts
 *
 * ════════════════════════════════════════════════════════════════
 * PROBLEMA ANTERIOR (loop N+1):
 *
 *   const fornecedores = await fornecedorService.listar(id_evento);   // 1 query
 *   for (const f of fornecedores) {                                    // N queries
 *     const pags = await pagamentoService.listarPorFornecedor(f.id);
 *   }
 *   // Total: 1 + N queries. Com 10 fornecedores = 11 queries.
 *
 * SOLUÇÃO (2 queries paralelas via Promise.all):
 *
 *   const [pagamentos, fornecedores] = await Promise.all([
 *     pagamentoService.listarPorEvento(id_evento),  // JOIN direto no Supabase
 *     fornecedorService.listar(id_evento),           // 1 query
 *   ]);
 *   // Total: sempre 2 queries, independente da quantidade de fornecedores.
 *   // Map<id_fornecedor, nome> resolve os nomes sem loop adicional.
 * ════════════════════════════════════════════════════════════════
 *
 * PADRÃO MVP DO PROJETO:
 *   FinanceiroScreen → FinanceiroPresenter → FinanceiroView (interface)
 *   attachView / detachView / handle*()
 *
 * UC06 — Registrar pagamento
 * UC07 — Consultar pagamentos
 * UC14 — Dashboard financeiro
 * RN-001: alertar quando gastos ultrapassarem orçamento
 * RN-002: controle de status de pagamento
 */

import type { PagamentoService }   from '../../../domain/services/PagamentoService';
import type { FornecedorService }  from '../../../domain/services/FornecedorService';
import type { Pagamento }          from '../../../domain/models';
import {
  formatarMoeda,
  formatarData,
  calcularDiasAte,
  labelProximidade,
  corStatusPagamento,
  labelStatusPagamento,
  calcularPercentual,
} from '../../../lib/formatters';
import type {
  FinanceiroViewModel,
  PagamentoFormatadoViewModel,
  ResumoFinanceiroViewModel,
} from '../models/FinanceiroViewModel';

// ── Interface View ─────────────────────────────────────────────
// A FinanceiroView implementa esta interface e passa para attachView().

export interface FinanceiroView {
  showLoading(): void;
  hideLoading(): void;
  showError(mensagem: string): void;
  /** Recebe FinanceiroViewModel completo — View só renderiza */
  onDadosCarregados(vm: FinanceiroViewModel): void;
  /** Após registrar — View adiciona o card na lista */
  onPagamentoRegistrado(vm: PagamentoFormatadoViewModel): void;
  /** Após marcar como pago */
  onPagamentoAtualizado(vm: PagamentoFormatadoViewModel): void;
  /** Após excluir */
  onPagamentoRemovido(id: number): void;
  /** Alerta de orçamento excedido — RN-001 */
  onAlertaOrcamento(mensagem: string): void;
}

// ── Presenter ──────────────────────────────────────────────────

export class FinanceiroPresenter {
  private view: FinanceiroView | null = null;

  constructor(
    private readonly pagamentoService:  PagamentoService,
    private readonly fornecedorService: FornecedorService,
  ) {}

  attachView(v: FinanceiroView): void { this.view = v; }
  detachView(): void                  { this.view = null; }

  // ── UC07 — Carregar dados financeiros ─────────────────────────

  /**
   * Carrega pagamentos do evento com 2 queries paralelas.
   * Constrói Map<id_fornecedor, nome> para resolver nomes sem loop.
   *
   * @param id_evento  ID do evento ativo
   * @param orcamento  Orçamento do evento (vem do EventoViewModel)
   */
  async handleCarregarFinanceiro(id_evento: number, orcamento: number): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();

    try {
      // ── 2 queries em paralelo — nunca mais N+1 ────────────────
      const [pagamentos, fornecedores] = await Promise.all([
        this.pagamentoService.listarPorEvento(id_evento),
        this.fornecedorService.listar(id_evento),
      ]);

      // ── Map para resolver nome sem loop adicional ─────────────
      // O(N) para montar, O(1) por consulta — muito mais eficiente.
      const nomeFornecedor = new Map<number, string>(
        fornecedores.map(f => [f.id_fornecedor, f.nome]),
      );

      // ── Transforma entidades brutas em ViewModels ─────────────
      const pagamentosVM = pagamentos.map(p =>
        this._transformarPagamento(
          p,
          nomeFornecedor.get(p.id_fornecedor) ?? 'Fornecedor não encontrado',
        ),
      );

      // ── Calcula resumo (RN-001, RN-002) ──────────────────────
      const resumo = this._calcularResumo(pagamentosVM, orcamento);

      const vm: FinanceiroViewModel = {
        resumo,
        pagamentos:      pagamentosVM,
        isCarregando:    false,
        erroMensagem:    null,
        alertaOrcamento: this._gerarAlerta(resumo),
      };

      this.view.onDadosCarregados(vm);

      if (vm.alertaOrcamento) {
        this.view.onAlertaOrcamento(vm.alertaOrcamento); // RN-001
      }
    } catch (e: any) {
      this.view.showError(e?.message ?? 'Erro ao carregar dados financeiros.');
    } finally {
      this.view.hideLoading();
    }
  }

  // ── UC06 — Registrar pagamento ────────────────────────────────

  async handleRegistrarPagamento(
    id_fornecedor:  number,
    fornecedorNome: string,
    valor:          string,
    vencimento:     string,
  ): Promise<void> {
    if (!this.view) return;

    const valorNum = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      this.view.showError('Valor inválido. Digite um número maior que zero.');
      return;
    }

    // Converte "DD/MM/AAAA" → "AAAA-MM-DD" para o banco
    const [dd, mm, aaaa] = vencimento.split('/');
    const vencimentoISO  = `${aaaa}-${mm}-${dd}`;

    this.view.showLoading();
    try {
      const pag = await this.pagamentoService.registrar(
        id_fornecedor, valorNum, vencimentoISO,
      );
      this.view.onPagamentoRegistrado(
        this._transformarPagamento(pag, fornecedorNome),
      );
    } catch (e: any) {
      this.view.showError(e?.message ?? 'Erro ao registrar pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }

  // ── RN-002 — Marcar como pago ─────────────────────────────────

  async handleMarcarComoPago(id_pagamento: number, fornecedorNome: string): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const pag = await this.pagamentoService.pagar(id_pagamento);
      this.view.onPagamentoAtualizado(this._transformarPagamento(pag, fornecedorNome));
    } catch (e: any) {
      this.view.showError(e?.message ?? 'Erro ao confirmar pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }

  // ── Remover ───────────────────────────────────────────────────

  async handleRemoverPagamento(id_pagamento: number): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      await this.pagamentoService.remover(id_pagamento);
      this.view.onPagamentoRemovido(id_pagamento);
    } catch (e: any) {
      this.view.showError(e?.message ?? 'Erro ao remover pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }

  // ── Transformações privadas ───────────────────────────────────

  /** Entidade bruta Pagamento → PagamentoFormatadoViewModel */
  private _transformarPagamento(
    raw: Pagamento,
    fornecedorNome: string,
  ): PagamentoFormatadoViewModel {
    const statusLabel = labelStatusPagamento(raw.status);
    const dias        = calcularDiasAte(raw.vencimento);
    // Atrasado = não pago E data de vencimento já passou
    const isAtrasado  = raw.status !== 'pago' && dias < 0;

    return {
      id:                  raw.id_pagamento,
      fornecedorId:        raw.id_fornecedor,
      fornecedorNome,
      valorFormatado:      formatarMoeda(raw.valor),
      valor:               raw.valor,
      vencimentoFormatado: formatarData(raw.vencimento),
      statusLabel:         isAtrasado ? 'Atrasado' : statusLabel,
      statusCor:           corStatusPagamento(isAtrasado ? 'atrasado' : raw.status),
      vencimentoLabel:     raw.status === 'pago'
                             ? 'Pago ✓'
                             : labelProximidade(dias, 'vencimento'),
      diasParaVencimento:  dias,
      isAtrasado,
      isHoje:              dias === 0 && raw.status !== 'pago',
    };
  }

  /** Resumo financeiro — RN-001 (controle de orçamento) */
  private _calcularResumo(
    pags: PagamentoFormatadoViewModel[],
    orcamento: number,
  ): ResumoFinanceiroViewModel {
    // Só conta como "gasto" o que foi efetivamente pago
    const gasto     = pags
      .filter(p => p.statusLabel === 'Pago')
      .reduce((acc, p) => acc + p.valor, 0);

    const saldo      = orcamento - gasto;
    const atrasados  = pags.filter(p => p.isAtrasado);

    return {
      orcamentoTotalFormatado:  formatarMoeda(orcamento),
      totalGastoFormatado:      formatarMoeda(gasto),
      saldoRestanteFormatado:   formatarMoeda(Math.abs(saldo)),
      percentualUtilizado:      calcularPercentual(gasto, orcamento),
      orcamentoExcedido:        saldo < 0,
      valorExcedidoFormatado:   saldo < 0
                                  ? `${formatarMoeda(Math.abs(saldo))} acima do orçamento`
                                  : null,
      totalAtrasadosFormatado:  formatarMoeda(atrasados.reduce((a, p) => a + p.valor, 0)),
      quantidadeAtrasados:      atrasados.length,
    };
  }

  /** Mensagem de alerta — RN-001 */
  private _gerarAlerta(r: ResumoFinanceiroViewModel): string | null {
    if (r.orcamentoExcedido)
      return `⚠️ Orçamento excedido em ${r.valorExcedidoFormatado}.`;
    if (r.percentualUtilizado >= 90)
      return `⚠️ ${r.percentualUtilizado.toFixed(0)}% do orçamento utilizado. Atenção!`;
    if (r.quantidadeAtrasados > 0)
      return `⚠️ ${r.quantidadeAtrasados} pagamento(s) em atraso — ${r.totalAtrasadosFormatado}.`;
    return null;
  }
}
