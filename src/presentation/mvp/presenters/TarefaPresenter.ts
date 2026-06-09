import { TarefaController } from '../../../application/api/controllers/TarefaController';
import { Tarefa,StatusTarefa,PrioridadeTarefa } from '../../../domain/models';
import { TarefaViewModel } from '../models/TarefaViewModel';

export interface TarefaView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;

  onTarefasCarregadas(
    tarefas: TarefaViewModel[],
  ): void;

  onTarefaCadastrada(
    tarefa: TarefaViewModel,
  ): void;

  onTarefaAtualizada(
    tarefa: TarefaViewModel,
  ): void;

  onTarefaRemovida(
    id: number,
  ): void;
}

export class TarefaPresenter {
  private view: TarefaView | null =
    null;

  constructor(
    private readonly tarefaController:
      TarefaController,
    private readonly id_evento:
      number,
  ) {}

  attachView(
    view: TarefaView,
  ) {
    this.view = view;
  }

  detachView() {
    this.view = null;
  }

  async carregarTarefas() {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const response =
        await this.tarefaController
          .listar(this.id_evento);

      if (!response.sucesso) {
        throw new Error(
          response.erro,
        );
      }

      const tarefas =
        (response.dados ?? []).map(
          tarefa =>
            this.toViewModel(
              tarefa,
            ),
        );

      this.view
        .onTarefasCarregadas(
          tarefas,
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
          'Erro ao carregar tarefas.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(
    descricao: string,
    prioridade:
      PrioridadeTarefa,
    prazo: string,
    responsavel: string,
  ) {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const response =
        await this.tarefaController
          .cadastrar(
            this.id_evento,
            descricao,
            prioridade,
            prazo || undefined,
            responsavel ||
              undefined,
          );

      if (!response.sucesso) {
        throw new Error(
          response.erro,
        );
      }

      this.view
        .onTarefaCadastrada(
          this.toViewModel(
            response.dados!,
          ),
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
          'Erro ao cadastrar tarefa.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleAtualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ) {
    if (!this.view) return;

    try {
      const response =
        await this.tarefaController
          .atualizarStatus(
            id_tarefa,
            status,
          );

      if (!response.sucesso) {
        throw new Error(
          response.erro,
        );
      }

      this.view
        .onTarefaAtualizada(
          this.toViewModel(
            response.dados!,
          ),
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
          'Erro ao atualizar status.',
      );
    }
  }

  async handleRemover(
    id_tarefa: number,
  ) {
    if (!this.view) return;

    try {
      const response =
        await this.tarefaController
          .remover(id_tarefa);

      if (!response.sucesso) {
        throw new Error(
          response.erro,
        );
      }

      this.view
        .onTarefaRemovida(
          id_tarefa,
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
          'Erro ao remover tarefa.',
      );
    }
  }

  private toViewModel(
    tarefa: Tarefa,
  ): TarefaViewModel {
    return {
      id: tarefa.id_tarefa,
      idEvento:
        tarefa.id_evento,
      descricao:
        tarefa.descricao,

      status:
        tarefa.status,

      statusLabel:
        this.getStatusLabel(
          tarefa.status,
        ),

      prioridade:
        tarefa.prioridade ??
        'media',

      prioridadeLabel:
        this.getPrioridadeLabel(
          tarefa.prioridade ??
            'media',
        ),

      prazo: tarefa.prazo,

      prazoFormatado:
        tarefa.prazo
          ? new Date(
              tarefa.prazo,
            ).toLocaleDateString(
              'pt-BR',
            )
          : undefined,

      responsavel:
        tarefa.responsavel,

      atrasada:
        !!tarefa.prazo &&
        new Date(
          tarefa.prazo,
        ) < new Date() &&
        tarefa.status !==
          'concluida',
    };
  }

  private getStatusLabel(
    status: StatusTarefa,
  ): string {
    const labels = {
      pendente:
        'Pendente',
      em_andamento:
        'Em andamento',
      concluida:
        'Concluída',
    };

    return labels[status];
  }

  private getPrioridadeLabel(
    prioridade:
      PrioridadeTarefa,
  ): string {
    const labels = {
      alta: 'Alta',
      media: 'Média',
      baixa: 'Baixa',
    };

    return labels[
      prioridade
    ];
  }
}