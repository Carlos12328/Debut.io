import { DashboardController } from '../../../application/api/controllers/DashboardController';
import { Evento, Tarefa } from '../../../domain/models';
import { DashboardViewModel, DashboardTarefaResumo } from '../models/DashboardViewModel';

export interface DashboardView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onDashboardCarregado(dados: DashboardViewModel): void;
}

export class DashboardPresenter {
  private view: DashboardView | null = null;

  constructor(
    private readonly dashboardController: DashboardController,
    private readonly evento: Evento,
  ) {}

  attachView(view: DashboardView) { this.view = view; }
  detachView() { this.view = null; }

  private fmt(d: string) { if (!d||!d.includes('-')) return d; const [a,m,dd]=d.split('-'); return `${dd}/${m}/${a}`; }

  async carregarDashboard() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.dashboardController.obterResumo(this.evento.id_evento);
      if (!r.sucesso || !r.dados) throw new Error(r.erro ?? 'Erro ao carregar dashboard.');
      const { pagamentos, tarefas } = r.dados;

      const totalGasto = pagamentos.reduce((s,p)=>s+Number(p.valor),0);
      const orcamentoTotal = Number(this.evento.orcamento);
      const disponivel = orcamentoTotal - totalGasto;
      const percentualComprometido = orcamentoTotal > 0 ? Math.min((totalGasto/orcamentoTotal)*100,100) : 0;
      const naoConcluidas = tarefas.filter(t=>t.status!=='concluida');

      const proximasTarefas: DashboardTarefaResumo[] = naoConcluidas
        .filter((t): t is Tarefa & { prazo: string } => !!t.prazo)
        .sort((a,b)=>a.prazo.localeCompare(b.prazo))
        .slice(0,3)
        .map(t=>({ id: t.id_tarefa, nome: t.descricao, prazoFormatado: this.fmt(t.prazo) }));

      this.view.onDashboardCarregado({
        nomeEvento: this.evento.nome,
        statusEvento: this.evento.status === 'ativo' ? 'ATIVO' : 'ENCERRADO',
        dataEventoFormatada: this.fmt(this.evento.data_evento),
        orcamentoTotal, totalGasto, disponivel, percentualComprometido,
        pendenciasLabel: `${naoConcluidas.length} de ${tarefas.length}`,
        proximasTarefas,
      });
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao carregar dashboard.'); }
    finally { this.view.hideLoading(); }
  }
}