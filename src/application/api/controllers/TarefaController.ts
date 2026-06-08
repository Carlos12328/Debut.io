import { TarefaServiceImpl } from '../../../domain/services/TarefaService';
import { PrioridadeTarefa, StatusTarefa } from '../../../domain/models';

export class TarefaController {
  constructor(
    private readonly tarefaService: TarefaServiceImpl,
  ) {}

  async cadastrar(
    id_evento: number,
    descricao: string,
    prioridade: PrioridadeTarefa,
    prazo?: string,
    responsavel?: string,
  ) {
    try {
      const tarefa = await this.tarefaService.cadastrar(
        id_evento,
        descricao,
        prioridade,
        prazo,
        responsavel,
      );

      return { sucesso: true, dados: tarefa };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async listar(id_evento: number) {
    try {
      const tarefas = await this.tarefaService.listar(id_evento);

      return { sucesso: true, dados: tarefas };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async atualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ) {
    try {
      const tarefa =
        await this.tarefaService.atualizarStatus(
          id_tarefa,
          status,
        );

      return { sucesso: true, dados: tarefa };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async remover(id_tarefa: number) {
    try {
      await this.tarefaService.remover(id_tarefa);

      return { sucesso: true };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }
}
