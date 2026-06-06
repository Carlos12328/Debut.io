import { EntityId } from './usuario';

export type StatusEvento = 'ativo' | 'encerrado';

export interface Evento {
  id_evento: EntityId;
  id_usuario: EntityId;
  nome: string;
  data_evento: string;
  orcamento: number;
  status: StatusEvento;
}
