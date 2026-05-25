import { TarefaService } from '../../../domain/services';
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../../../domain/models';

export interface TarefaView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onTarefasCarregadas(tarefas: Tarefa[]): void;
  onTarefaCadastrada(tarefa: Tarefa): void;
  onTarefaAtualizada(tarefa: Tarefa): void;
  onTarefaRemovida(id: number): void;
}

export class TarefaPresenter {
  private view: TarefaView | null = null;

  constructor(private readonly tarefaService: TarefaService, private readonly id_evento: number) {}

  attachView(view: TarefaView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarTarefas() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const lista = await this.tarefaService.listar(this.id_evento);
      this.view.onTarefasCarregadas(lista);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao carregar tarefas.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(descricao: string, prioridade: PrioridadeTarefa, prazo: string, responsavel: string) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const tarefa = await this.tarefaService.cadastrar(
        this.id_evento, descricao, prioridade,
        prazo || undefined, responsavel || undefined
      );
      this.view.onTarefaCadastrada(tarefa);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao cadastrar tarefa.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleAtualizarStatus(id_tarefa: number, status: StatusTarefa) {
    if (!this.view) return;
    try {
      const tarefa = await this.tarefaService.atualizarStatus(id_tarefa, status);
      this.view.onTarefaAtualizada(tarefa);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao atualizar status.');
    }
  }

  async handleRemover(id_tarefa: number) {
    if (!this.view) return;
    try {
      await this.tarefaService.remover(id_tarefa);
      this.view.onTarefaRemovida(id_tarefa);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao remover tarefa.');
    }
  }
}
