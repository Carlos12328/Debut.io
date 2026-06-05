import { EntityId } from './usuario';

export interface Compromisso {
  id_compromisso: EntityId;
  id_evento: EntityId;
  descricao: string;
  data_compromisso: string;
}
