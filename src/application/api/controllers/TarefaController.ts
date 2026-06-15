import { TarefaServiceImpl, AtualizarTarefaInput } from '../../../domain/services/TarefaService';
import {
  CategoriaTarefa,
  PrioridadeTarefa,
  StatusTarefa,
} from '../../../domain/models';

export class TarefaController {
  constructor(
    private readonly tarefaService: TarefaServiceImpl,
  ) {}

  async cadastrar(
    id_evento: number,
    descricao: string,
    categoria: CategoriaTarefa,
    prioridade: PrioridadeTarefa,
    prazo: string,
    responsavel: string,
  ) {
    try {
      const tarefa = await this.tarefaService.cadastrar(
        id_evento,
        descricao,
        categoria,
        prioridade,
        prazo,
        responsavel,
      );

      return { sucesso: true, dados: tarefa };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message ?? 'Erro ao cadastrar tarefa.',
      };
    }
  }

  async listar(id_evento: number) {
    try {
      const tarefas = await this.tarefaService.listar(id_evento);

      return { sucesso: true, dados: tarefas };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message ?? 'Erro ao listar tarefas.',
      };
    }
  }

  async editar(
    id_tarefa: number,
    dados: AtualizarTarefaInput,
  ) {
    try {
      const tarefa = await this.tarefaService.editar(
        id_tarefa,
        dados,
      );

      return { sucesso: true, dados: tarefa };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message ?? 'Erro ao editar tarefa.',
      };
    }
  }

  async atualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ) {
    try {
      const tarefa = await this.tarefaService.atualizarStatus(
        id_tarefa,
        status,
      );

      return { sucesso: true, dados: tarefa };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message ?? 'Erro ao atualizar status da tarefa.',
      };
    }
  }

  async remover(id_tarefa: number) {
    try {
      await this.tarefaService.remover(id_tarefa);

      return { sucesso: true };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message ?? 'Erro ao remover tarefa.',
      };
    }
  }
}
