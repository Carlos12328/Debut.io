import {
  EntityId, Compromisso, Evento, Pagamento,
  Fornecedor, Tarefa, Usuario,
} from '../../domain/models';

export interface Repository<T> {
  getById(id: EntityId): Promise<T | null>;
  list(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: EntityId, data: Partial<T>): Promise<T>;
  remove(id: EntityId): Promise<void>;
}

export interface UsuarioRepository extends Repository<Usuario> {
  getByEmail(email: string): Promise<Usuario | null>;
}

export interface EventoRepository extends Repository<Evento> {
  getByUsuario(id_usuario: EntityId): Promise<Evento[]>;
}

export interface FornecedorRepository extends Repository<Fornecedor> {
  getByEvento(id_evento: EntityId): Promise<Fornecedor[]>;
}

export interface PagamentoRepository extends Repository<Pagamento> {
  getByFornecedor(id_fornecedor: EntityId): Promise<Pagamento[]>;
  getByEvento(id_evento: EntityId): Promise<Pagamento[]>;
}

export interface TarefaRepository extends Repository<Tarefa> {
  getByEvento(id_evento: EntityId): Promise<Tarefa[]>;
}

export interface CompromissoRepository extends Repository<Compromisso> {
  getByEvento(id_evento: EntityId): Promise<Compromisso[]>;
}
