import { DashboardController } from '../../../application/api/controllers/DashboardController';
import { Evento, Tarefa, PrioridadeTarefa } from '../../../domain/models';
import { DashboardViewModel, DashboardTarefaResumo, DashboardCompromissoResumo } from '../models/DashboardViewModel';

const ORDEM_PRIORIDADE: Record<PrioridadeTarefa, number> = { alta: 0, media: 1, baixa: 2 };

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
      const { pagamentos, tarefas, compromissos } = r.dados;

      const totalGasto = pagamentos.reduce((s,p)=>s+Number(p.valor),0);
      const orcamentoTotal = Number(this.evento.orcamento);
      const disponivel = orcamentoTotal - totalGasto;
      const percentualComprometido = orcamentoTotal > 0 ? Math.min((totalGasto/orcamentoTotal)*100,100) : 0;
      const naoConcluidas = tarefas.filter(t=>t.status!=='concluida');

      const proximasTarefas: DashboardTarefaResumo[] = naoConcluidas
        .filter((t): t is Tarefa & { prazo: string } => !!t.prazo)
        .sort((a,b)=>{
          const pa = ORDEM_PRIORIDADE[a.prioridade ?? 'media'];
          const pb = ORDEM_PRIORIDADE[b.prioridade ?? 'media'];
          if (pa !== pb) return pa - pb;
          return a.prazo.localeCompare(b.prazo);
        })
        .slice(0,3)
        .map(t=>({ id: t.id_tarefa, nome: t.descricao, prazoFormatado: this.fmt(t.prazo), prioridade: t.prioridade ?? 'media' }));

      const proximosCompromissos: DashboardCompromissoResumo[] = compromissos
        .slice()
        .sort((a,b)=>`${a.data_compromisso} ${a.horario ?? ''}`.localeCompare(`${b.data_compromisso} ${b.horario ?? ''}`))
        .slice(0,3)
        .map(c=>({ id: c.id_compromisso, descricao: c.descricao, dataFormatada: this.fmt(c.data_compromisso), horario: c.horario ?? '' }));

      this.view.onDashboardCarregado({
        nomeEvento: this.evento.nome,
        statusEvento: this.evento.status === 'ativo' ? 'ATIVO' : 'ENCERRADO',
        dataEventoFormatada: this.fmt(this.evento.data_evento),
        orcamentoTotal, totalGasto, disponivel, percentualComprometido,
        pendenciasLabel: `${naoConcluidas.length} de ${tarefas.length}`,
        proximasTarefas,
        proximosCompromissos,
      });
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao carregar dashboard.'); }
    finally { this.view.hideLoading(); }
  }
}
