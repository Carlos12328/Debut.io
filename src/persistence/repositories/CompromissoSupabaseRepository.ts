import { Compromisso, EntityId } from '../../domain/models';
import { CompromissoRepository } from './index';
import { supabase } from '../../lib/supabase';

async function executarComTimeout<T>(
  operacao: PromiseLike<T>,
  mensagem: string,
): Promise<T> {
  return await Promise.race([
    Promise.resolve(operacao),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(mensagem)), 15000);
    }),
  ]);
}

export class CompromissoSupabaseRepository implements CompromissoRepository {
  async getByEvento(id_evento: EntityId): Promise<Compromisso[]> {
    const { data, error } = await executarComTimeout(
      supabase
        .from('compromisso')
        .select('*')
        .eq('id_evento', id_evento)
        .order('data_compromisso', { ascending: true })
        .order('horario', { ascending: true }),
      'Tempo limite ao listar compromissos. Verifique a conexão com o Supabase.',
    );

    if (error) {
      throw new Error(`Erro ao listar compromissos: ${error.message}`);
    }

    return (data ?? []) as Compromisso[];
  }

  async getById(id: EntityId): Promise<Compromisso | null> {
    const { data, error } = await executarComTimeout(
      supabase
        .from('compromisso')
        .select('*')
        .eq('id_compromisso', id)
        .maybeSingle(),
      'Tempo limite ao buscar compromisso. Verifique a conexão com o Supabase.',
    );

    if (error) {
      throw new Error(`Erro ao buscar compromisso: ${error.message}`);
    }

    return data as Compromisso | null;
  }

  async list(): Promise<Compromisso[]> {
    const { data, error } = await executarComTimeout(
      supabase
        .from('compromisso')
        .select('*')
        .order('data_compromisso', { ascending: true })
        .order('horario', { ascending: true }),
      'Tempo limite ao listar compromissos. Verifique a conexão com o Supabase.',
    );

    if (error) {
      throw new Error(`Erro ao listar compromissos: ${error.message}`);
    }

    return (data ?? []) as Compromisso[];
  }

  async create(data: Compromisso): Promise<Compromisso> {
    const { data: novo, error } = await executarComTimeout(
      supabase
        .from('compromisso')
        .insert({
          id_evento: data.id_evento,
          descricao: data.descricao,
          data_compromisso: data.data_compromisso,
          horario: data.horario ?? null,
          observacoes: data.observacoes ?? null,
          alerta_configurado: data.alerta_configurado ?? true,
        })
        .select()
        .single(),
      'Tempo limite ao cadastrar compromisso. Verifique a conexão com o Supabase.',
    );

    if (error) {
      throw new Error(`Erro ao cadastrar compromisso: ${error.message}`);
    }

    if (!novo) {
      throw new Error('Compromisso não retornado após cadastro.');
    }

    return novo as Compromisso;
  }

  async update(
    id: EntityId,
    data: Partial<Compromisso>,
  ): Promise<Compromisso> {
    const payload = {
      descricao: data.descricao,
      data_compromisso: data.data_compromisso,
      horario: data.horario ?? null,
      observacoes: data.observacoes ?? null,
      alerta_configurado: data.alerta_configurado ?? true,
    };

    const { data: atualizado, error } = await executarComTimeout(
      supabase
        .from('compromisso')
        .update(payload)
        .eq('id_compromisso', id)
        .select()
        .single(),
      'Tempo limite ao atualizar compromisso. Verifique a conexão com o Supabase.',
    );

    if (error) {
      throw new Error(`Erro ao atualizar compromisso: ${error.message}`);
    }

    if (!atualizado) {
      throw new Error('Compromisso não retornado após atualização.');
    }

    return atualizado as Compromisso;
  }

  async remove(id: EntityId): Promise<void> {
    const { error } = await executarComTimeout(
      supabase
        .from('compromisso')
        .delete()
        .eq('id_compromisso', id),
      'Tempo limite ao remover compromisso. Verifique a conexão com o Supabase.',
    );

    if (error) {
      throw new Error(`Erro ao remover compromisso: ${error.message}`);
    }
  }
}
