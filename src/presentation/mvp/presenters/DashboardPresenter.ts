/**
 * DashboardPresenter.ts — Debut.io
 * src/presentation/mvp/presenters/DashboardPresenter.ts
 *
 * Padrão MVP: classe + interface View + attachView/detachView.
 * UC14 — Dashboard financeiro | UC15 — Visão geral
 */
import type { DashboardController } from '../../../application/api/controllers/DashboardController';
import {
  formatarMoeda, formatarData, calcularDiasAte,
  labelProximidade, calcularPercentual,
  corPrioridade, labelPrioridade,
} from '../../../lib/formatters';
import type {
  DashboardViewModel, ResumoFinanceiroDashboard,
  ResumoTarefasDashboard, CompromissoDashboardItem,
  TarefaDashboardItem, AlertaDashboard,
} from '../models/DashboardViewModel';
import type { Tarefa, Pagamento, Compromisso, Fornecedor, Evento } from '../../../domain/models';

// ── Interface View ─────────────────────────────────────────────
export interface DashboardView {
  showLoading(): void;
  hideLoading(): void;
  showError(msg: string): void;
  onDashboardCarregado(vm: DashboardViewModel): void;
}

// ── Presenter ──────────────────────────────────────────────────
export class DashboardPresenter {
  private view: DashboardView | null = null;

  constructor(private readonly controller: DashboardController) {}

  attachView(v: DashboardView): void { this.view = v; }
  detachView(): void                 { this.view = null; }

  /**
   * Recebe o Evento completo — já disponível na DashboardScreen.
   * Remove necessidade de buscar eventos separadamente.
   */
  async handleCarregarDashboard(evento: Evento): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.controller.carregarDashboard(evento);

      // || !r.dados resolve o erro de narrowing do TypeScript
      if (!r.sucesso || !r.dados) {
        throw new Error((r as any).erro ?? 'Dados indisponíveis.');
      }

      const { tarefas, pagamentos, compromissos, fornecedores } = r.dados;

      const vm = this._construirViewModel(
        evento, tarefas, pagamentos, compromissos, fornecedores,
      );
      this.view.onDashboardCarregado(vm);
    } catch (e: any) {
      this.view.showError(e?.message ?? 'Erro ao carregar dashboard.');
    } finally {
      this.view.hideLoading();
    }
  }

  // ── Construção do ViewModel ───────────────────────────────────

  private _construirViewModel(
    evento: Evento,
    tarefas: Tarefa[],
    pagamentos: Pagamento[],
    compromissos: Compromisso[],
    fornecedores: Fornecedor[],
  ): DashboardViewModel {
    const diasFesta = calcularDiasAte(evento.data_evento);
    const resumoFin = this._calcularFinanceiro(pagamentos, evento.orcamento);
    const resumoTar = this._calcularTarefas(tarefas);
    const proxComp  = this._proximosCompromissos(compromissos);
    const urgentes  = this._tarefasUrgentes(tarefas);
    const alertas   = this._gerarAlertas(resumoFin, resumoTar, proxComp);

    return {
      eventoNome:           evento.nome,
      contagemRegressiva:   labelProximidade(diasFesta, 'festa'),
      resumoFinanceiro:     resumoFin,
      resumoTarefas:        resumoTar,
      proximosCompromissos: proxComp,
      tarefasUrgentes:      urgentes,
      totalFornecedores:    fornecedores.length,
      alertas,
      isCarregando:         false,
      erroMensagem:         null,
    };
  }

  private _calcularFinanceiro(pags: Pagamento[], orcamento: number): ResumoFinanceiroDashboard {
    const gasto     = pags.filter(p => p.status === 'pago').reduce((a, p) => a + p.valor, 0);
    const atrasados = pags.filter(p => p.status !== 'pago' && calcularDiasAte(p.vencimento) < 0);
    return {
      orcamento:    formatarMoeda(orcamento),
      totalGasto:   formatarMoeda(gasto),
      saldo:        formatarMoeda(Math.abs(orcamento - gasto)),
      percentual:   calcularPercentual(gasto, orcamento),
      excedido:     gasto > orcamento,
      atrasados:    atrasados.length,
      totalAtrasado: formatarMoeda(atrasados.reduce((a, p) => a + p.valor, 0)),
    };
  }

  private _calcularTarefas(tarefas: Tarefa[]): ResumoTarefasDashboard {
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;
    const atrasadas  = tarefas.filter(
      t => t.prazo && t.status !== 'concluida' && calcularDiasAte(t.prazo) < 0,
    ).length;
    return {
      total:      tarefas.length,
      concluidas,
      pendentes:  tarefas.filter(t => t.status === 'pendente').length,
      atrasadas,
      percentual: calcularPercentual(concluidas, tarefas.length),
    };
  }

  private _proximosCompromissos(comps: Compromisso[]): CompromissoDashboardItem[] {
    return comps
      .map(c => ({ ...c, dias: calcularDiasAte(c.data_compromisso) }))
      .filter(c => c.dias >= -1)
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 5)
      .map(c => ({
        id:            c.id_compromisso,
        descricao:     c.descricao,
        dataFormatada: formatarData(c.data_compromisso),
        diasLabel:     labelProximidade(c.dias, 'compromisso'),
        cor:           c.dias === 0 ? '#e74c3c' : c.dias <= 7 ? '#f39c12' : '#3498db',
        isHoje:        c.dias === 0,
      }));
  }

  private _tarefasUrgentes(tarefas: Tarefa[]): TarefaDashboardItem[] {
    return tarefas
      .filter(t => t.status !== 'concluida' && (
        t.prioridade === 'alta' || (t.prazo && calcularDiasAte(t.prazo) < 0)
      ))
      .slice(0, 5)
      .map(t => {
        const dias = t.prazo ? calcularDiasAte(t.prazo) : 0;
        return {
          id:            t.id_tarefa,
          descricao:     t.descricao,
          prioridade:    labelPrioridade(t.prioridade ?? 'baixa'),
          prioridadeCor: corPrioridade(t.prioridade ?? 'baixa'),
          prazoLabel:    t.prazo ? labelProximidade(dias, 'prazo') : 'Sem prazo',
          isAtrasada:    !!t.prazo && dias < 0,
        };
      });
  }

  private _gerarAlertas(
    fin: ResumoFinanceiroDashboard,
    tar: ResumoTarefasDashboard,
    comp: CompromissoDashboardItem[],
  ): AlertaDashboard[] {
    const alertas: AlertaDashboard[] = [];
    if (fin.excedido)
      alertas.push({ id: 'orcamento', tipo: 'urgente', cor: '#e74c3c', mensagem: `Orcamento excedido! Saldo negativo: ${fin.saldo}` });
    if (fin.atrasados > 0)
      alertas.push({ id: 'pagamentos', tipo: 'aviso', cor: '#f39c12', mensagem: `${fin.atrasados} pagamento(s) em atraso` });
    if (tar.atrasadas > 0)
      alertas.push({ id: 'tarefas', tipo: 'aviso', cor: '#f39c12', mensagem: `${tar.atrasadas} tarefa(s) com prazo vencido` });
    if (comp.some(c => c.isHoje))
      alertas.push({ id: 'hoje', tipo: 'info', cor: '#3498db', mensagem: 'Voce tem compromisso hoje!' });
    return alertas;
  }
}
