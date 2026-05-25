import { TarefaService } from '../../../domain/services';
import { Tarefa } from '../../../domain/models';

export interface TarefaView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onTarefasCarregadas(tarefas: Tarefa[]): void;
  onTarefaCadastrada(tarefa: Tarefa): void;
  onTarefaConcluida(tarefa: Tarefa): void;
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

  async handleCadastrar(descricao: string) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const tarefa = await this.tarefaService.cadastrar(this.id_evento, descricao);
      this.view.onTarefaCadastrada(tarefa);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao cadastrar tarefa.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleConcluir(id_tarefa: number) {
    if (!this.view) return;
    try {
      const tarefa = await this.tarefaService.concluir(id_tarefa);
      this.view.onTarefaConcluida(tarefa);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao concluir tarefa.');
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
