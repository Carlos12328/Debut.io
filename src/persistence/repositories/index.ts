import {
  EntityId,
  Compromisso,
  Evento,
  Pagamento,
  Fornecedor,
  Tarefa,
  Usuario,
} from '../../domain/models';

export interface Repository<T> {
  getById(id: EntityId): Promise<T | null>;
  list(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: EntityId, data: Partial<T>): Promise<T>;
  remove(id: EntityId): Promise<void>;
}

export interface UsuarioRepository extends Repository<Usuario> {}
export interface EventoRepository extends Repository<Evento> {}
export interface FornecedorRepository extends Repository<Fornecedor> {}
export interface PagamentoRepository extends Repository<Pagamento> {}
export interface TarefaRepository extends Repository<Tarefa> {}
export interface CompromissoRepository extends Repository<Compromisso> {}


// Adicione este método à interface UsuarioRepository existente:
export interface UsuarioRepository extends Repository<Usuario> {
  getByEmail(email: string): Promise<Usuario | null>;
}