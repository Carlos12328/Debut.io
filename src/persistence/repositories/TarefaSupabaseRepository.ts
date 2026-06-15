import { Tarefa, EntityId } from '../../domain/models';
import { TarefaRepository } from './index';
import { supabase } from '../../lib/supabase';

const TIMEOUT_MS = 10000;

interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
  } | null;
}

async function withTimeout<T>(
  operacao: any,
  mensagemErro = 'Tempo limite excedido ao acessar o banco de dados.',
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(mensagemErro));
    }, TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      Promise.resolve(operacao),
      timeout,
    ]) as T;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export class TarefaSupabaseRepository implements TarefaRepository {
  async getByEvento(id_evento: EntityId): Promise<Tarefa[]> {
    const { data, error } = await withTimeout<SupabaseResponse<Tarefa[]>>(
      supabase
        .from('tarefa')
        .select('*')
        .eq('id_evento', id_evento)
        .order('prazo', { ascending: true }),
    );

    if (error) {
      throw new Error(`Erro ao listar tarefas: ${error.message}`);
    }

    return data ?? [];
  }

  async getById(id: EntityId): Promise<Tarefa | null> {
    const { data, error } = await withTimeout<SupabaseResponse<Tarefa>>(
      supabase
        .from('tarefa')
        .select('*')
        .eq('id_tarefa', id)
        .single(),
    );

    if (error) {
      throw new Error(`Erro ao buscar tarefa: ${error.message}`);
    }

    return data ?? null;
  }

  async list(): Promise<Tarefa[]> {
    const { data, error } = await withTimeout<SupabaseResponse<Tarefa[]>>(
      supabase
        .from('tarefa')
        .select('*')
        .order('prazo', { ascending: true }),
    );

    if (error) {
      throw new Error(`Erro ao listar tarefas: ${error.message}`);
    }

    return data ?? [];
  }

  async create(data: Tarefa): Promise<Tarefa> {
    const { data: nova, error } = await withTimeout<SupabaseResponse<Tarefa>>(
      supabase
        .from('tarefa')
        .insert({
          id_evento: data.id_evento,
          descricao: data.descricao,
          categoria: data.categoria,
          status: data.status,
          prioridade: data.prioridade,
          prazo: data.prazo,
          responsavel: data.responsavel,
        })
        .select()
        .single(),
    );

    if (error) {
      throw new Error(`Erro ao cadastrar tarefa: ${error.message}`);
    }

    if (!nova) {
      throw new Error('A tarefa não foi retornada após o cadastro.');
    }

    return nova;
  }

  async update(id: EntityId, data: Partial<Tarefa>): Promise<Tarefa> {
    const dadosAtualizacao: Record<string, unknown> = {
      descricao: data.descricao,
      categoria: data.categoria,
      status: data.status,
      prioridade: data.prioridade,
      prazo: data.prazo,
      responsavel: data.responsavel,
    };

    Object.keys(dadosAtualizacao).forEach((key) => {
      if (dadosAtualizacao[key] === undefined) {
        delete dadosAtualizacao[key];
      }
    });

    const { data: atualizada, error } = await withTimeout<SupabaseResponse<Tarefa>>(
      supabase
        .from('tarefa')
        .update(dadosAtualizacao)
        .eq('id_tarefa', id)
        .select()
        .single(),
    );

    if (error) {
      throw new Error(`Erro ao atualizar tarefa: ${error.message}`);
    }

    if (!atualizada) {
      throw new Error('A tarefa não foi retornada após a atualização.');
    }

    return atualizada;
  }

  async remove(id: EntityId): Promise<void> {
    const { error } = await withTimeout<SupabaseResponse<null>>(
      supabase
        .from('tarefa')
        .delete()
        .eq('id_tarefa', id),
    );

    if (error) {
      throw new Error(`Erro ao remover tarefa: ${error.message}`);
    }
  }
}
