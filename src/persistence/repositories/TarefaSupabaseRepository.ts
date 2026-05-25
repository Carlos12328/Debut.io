import { Tarefa, EntityId } from '../../domain/models';
import { TarefaRepository } from './index';
import { supabase } from '../../lib/supabase';

export class TarefaSupabaseRepository implements TarefaRepository {
  async getByEvento(id_evento: EntityId): Promise<Tarefa[]> {
    const { data } = await supabase.from('tarefa').select('*').eq('id_evento', id_evento);
    return data ?? [];
  }

  async getById(id: EntityId): Promise<Tarefa | null> {
    const { data } = await supabase.from('tarefa').select('*').eq('id_tarefa', id).single();
    return data ?? null;
  }

  async list(): Promise<Tarefa[]> {
    const { data } = await supabase.from('tarefa').select('*');
    return data ?? [];
  }

  async create(data: Tarefa): Promise<Tarefa> {
    const { data: nova } = await supabase
      .from('tarefa')
      .insert({ id_evento: data.id_evento, descricao: data.descricao, status: data.status })
      .select().single();
    return nova!;
  }

  async update(id: EntityId, data: Partial<Tarefa>): Promise<Tarefa> {
    const { data: atualizada } = await supabase.from('tarefa').update(data).eq('id_tarefa', id).select().single();
    return atualizada!;
  }

  async remove(id: EntityId): Promise<void> {
    await supabase.from('tarefa').delete().eq('id_tarefa', id);
  }
}
