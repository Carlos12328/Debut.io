import { TarefaController } from '../../../application/api/controllers/TarefaController';
import {
  Tarefa,
  StatusTarefa,
  PrioridadeTarefa,
  CategoriaTarefa,
} from '../../../domain/models';
import { AtualizarTarefaInput } from '../../../domain/services/TarefaService';
import { TarefaViewModel } from '../models/TarefaViewModel';

export interface TarefaView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  showSuccess(message: string): void;

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
  private view: TarefaView | null = null;

  constructor(
    private readonly tarefaController: TarefaController,
    private readonly id_evento: number,
  ) {}

  attachView(view: TarefaView) {
    this.view = view;
  }

  detachView() {
    this.view = null;
  }

  async carregarTarefas() {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const response = await this.tarefaController.listar(
        this.id_evento,
      );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      const tarefas = (response.dados ?? []).map((tarefa) =>
        this.toViewModel(tarefa),
      );

      this.view.onTarefasCarregadas(tarefas);
    } catch (e: any) {
      this.view.showError(
        e.message ?? 'Erro ao carregar tarefas.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(
    descricao: string,
    categoria: CategoriaTarefa,
    prioridade: PrioridadeTarefa,
    prazo: string,
    responsavel: string,
  ) {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const prazoISO = this.normalizarPrazo(prazo);

      const response = await this.tarefaController.cadastrar(
        this.id_evento,
        descricao,
        categoria,
        prioridade,
        prazoISO,
        responsavel,
      );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view.onTarefaCadastrada(
        this.toViewModel(response.dados!),
      );

      this.view.showSuccess('Tarefa cadastrada com sucesso.');
    } catch (e: any) {
      this.view.showError(
        e.message ?? 'Erro ao cadastrar tarefa.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleEditar(
    id_tarefa: number,
    dados: AtualizarTarefaInput,
  ) {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const dadosAtualizados: AtualizarTarefaInput = {
        ...dados,
      };

      if (dados.prazo !== undefined) {
        dadosAtualizados.prazo = this.normalizarPrazo(
          dados.prazo,
        );
      }

      const response = await this.tarefaController.editar(
        id_tarefa,
        dadosAtualizados,
      );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view.onTarefaAtualizada(
        this.toViewModel(response.dados!),
      );

      this.view.showSuccess('Tarefa atualizada com sucesso.');
    } catch (e: any) {
      this.view.showError(
        e.message ?? 'Erro ao editar tarefa.',
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

    this.view.showLoading();

    try {
      const response = await this.tarefaController.atualizarStatus(
        id_tarefa,
        status,
      );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view.onTarefaAtualizada(
        this.toViewModel(response.dados!),
      );

      this.view.showSuccess(
        this.getMensagemStatusAtualizado(status),
      );
    } catch (e: any) {
      this.view.showError(
        e.message ?? 'Erro ao atualizar status.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRemover(id_tarefa: number) {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const response = await this.tarefaController.remover(
        id_tarefa,
      );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view.onTarefaRemovida(id_tarefa);
      this.view.showSuccess('Tarefa removida com sucesso.');
    } catch (e: any) {
      this.view.showError(
        e.message ?? 'Erro ao remover tarefa.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  private getMensagemStatusAtualizado(
    status: StatusTarefa,
  ): string {
    const mensagens: Record<StatusTarefa, string> = {
      pendente: 'Tarefa marcada como pendente.',
      em_andamento: 'Tarefa marcada como em andamento.',
      concluida: 'Tarefa marcada como concluída.',
    };

    return mensagens[status];
  }

  private toViewModel(tarefa: Tarefa): TarefaViewModel {
    const categoria = tarefa.categoria ?? 'outros';
    const prioridade = tarefa.prioridade ?? 'media';
    const status = tarefa.status ?? 'pendente';
    const prazo = tarefa.prazo ?? '';

    const analisePrazo = this.analisarPrazo(
      prazo,
      status,
    );

    return {
      id: tarefa.id_tarefa,
      idEvento: tarefa.id_evento,
      descricao: tarefa.descricao,

      categoria,
      categoriaLabel: this.getCategoriaLabel(categoria),

      status,
      statusLabel: this.getStatusLabel(status),

      prioridade,
      prioridadeLabel: this.getPrioridadeLabel(prioridade),

      prazo,
      prazoFormatado: this.formatarDataBR(prazo),

      responsavel: tarefa.responsavel ?? '',

      atrasada: analisePrazo.atrasada,
      proximaDoPrazo: analisePrazo.proximaDoPrazo,
    };
  }

  private getStatusLabel(status: StatusTarefa): string {
    const labels: Record<StatusTarefa, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em andamento',
      concluida: 'Concluída',
    };

    return labels[status];
  }

  private getPrioridadeLabel(
    prioridade: PrioridadeTarefa,
  ): string {
    const labels: Record<PrioridadeTarefa, string> = {
      alta: 'Alta',
      media: 'Média',
      baixa: 'Baixa',
    };

    return labels[prioridade];
  }

  private getCategoriaLabel(
    categoria: CategoriaTarefa,
  ): string {
    const labels: Record<CategoriaTarefa, string> = {
      buffet: 'Buffet',
      decoracao: 'Decoração',
      vestuario: 'Vestuário',
      fotografia: 'Fotografia',
      musica: 'Música',
      local: 'Local',
      convites: 'Convites',
      outros: 'Outros',
    };

    return labels[categoria];
  }

  private normalizarPrazo(prazo: string): string {
    const valor = prazo.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      this.validarDataISO(valor);
      return valor;
    }

    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);

    if (!match) {
      throw new Error(
        'Informe o prazo no formato DD/MM/AAAA.',
      );
    }

    const [, dia, mes, ano] = match;
    const dataISO = `${ano}-${mes}-${dia}`;

    this.validarDataISO(dataISO);

    return dataISO;
  }

  private validarDataISO(dataISO: string) {
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);

    const dataValida =
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia;

    if (!dataValida) {
      throw new Error(
        'Informe um prazo válido para a tarefa.',
      );
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    if (data < hoje) {
      throw new Error(
        'O prazo da tarefa não pode ser anterior à data atual.',
      );
    }
  }

  private formatarDataBR(dataISO: string): string {
    if (!dataISO) return '';

    const partes = dataISO.split('-');

    if (partes.length !== 3) {
      return dataISO;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  private analisarPrazo(
    dataISO: string,
    status: StatusTarefa,
  ): {
    atrasada: boolean;
    proximaDoPrazo: boolean;
  } {
    if (!dataISO || status === 'concluida') {
      return {
        atrasada: false,
        proximaDoPrazo: false,
      };
    }

    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const prazo = new Date(ano, mes - 1, dia, 23, 59, 59);
    const agora = new Date();

    const diferencaMs = prazo.getTime() - agora.getTime();
    const quarentaEOitoHorasMs = 48 * 60 * 60 * 1000;

    return {
      atrasada: diferencaMs < 0,
      proximaDoPrazo:
        diferencaMs >= 0 &&
        diferencaMs <= quarentaEOitoHorasMs,
    };
  }
}







