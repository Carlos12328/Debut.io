import { EntityId } from './usuario';

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida';
export type PrioridadeTarefa = 'alta' | 'media' | 'baixa';

export interface Tarefa {
  id_tarefa: EntityId;
  id_evento: EntityId;
  descricao: string;
  status: StatusTarefa;
  prioridade?: PrioridadeTarefa;
  prazo?: string;
  responsavel?: string;
}
