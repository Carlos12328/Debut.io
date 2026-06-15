import { EntityId } from './usuario';

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida';

export type PrioridadeTarefa = 'alta' | 'media' | 'baixa';

export type CategoriaTarefa =
  | 'buffet'
  | 'decoracao'
  | 'vestuario'
  | 'fotografia'
  | 'musica'
  | 'local'
  | 'convites'
  | 'outros';

export interface Tarefa {
  id_tarefa: EntityId;
  id_evento: EntityId;
  descricao: string;
  categoria: CategoriaTarefa;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  prazo: string;
  responsavel: string;
}
