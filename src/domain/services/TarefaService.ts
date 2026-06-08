import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../models/tarefa';
import { TarefaRepository } from '../../persistence/repositories';

export interface TarefaService {
  cadastrar(
    id_evento: number,
    descricao: string,
    prioridade: PrioridadeTarefa,
    prazo?: string,
    responsavel?: string,
  ): Promise<Tarefa>;

  listar(id_evento: number): Promise<Tarefa[]>;

  atualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ): Promise<Tarefa>;

  remover(id_tarefa: number): Promise<void>;
}

export class TarefaServiceImpl implements TarefaService {
  constructor(
    private readonly tarefaRepository: TarefaRepository,
  ) {}

  async cadastrar(
    id_evento: number,
    descricao: string,
    prioridade: PrioridadeTarefa,
    prazo?: string,
    responsavel?: string,
  ): Promise<Tarefa> {
    if (!descricao) {
      throw new Error('A descricao da tarefa e obrigatoria.');
    }

    return await this.tarefaRepository.create({
      id_tarefa: 0,
      id_evento,
      descricao,
      status: 'pendente',
      prioridade,
      prazo,
      responsavel,
    });
  }

  async listar(id_evento: number): Promise<Tarefa[]> {
    return await this.tarefaRepository.getByEvento(id_evento);
  }

  async atualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ): Promise<Tarefa> {
    return await this.tarefaRepository.update(
      id_tarefa,
      { status },
    );
  }

  async remover(id_tarefa: number): Promise<void> {
    return await this.tarefaRepository.remove(id_tarefa);
  }
}
