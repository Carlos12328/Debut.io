import { Compromisso, EntityId } from '../../domain/models';
import { CompromissoRepository } from './index';
import { supabase } from '../../lib/supabase';

export class CompromissoSupabaseRepository implements CompromissoRepository {
  async getByEvento(id_evento: EntityId): Promise<Compromisso[]> {
    const { data } = await supabase.from('compromisso').select('*').eq('id_evento', id_evento);
    return data ?? [];
  }

  async getById(id: EntityId): Promise<Compromisso | null> {
    const { data } = await supabase.from('compromisso').select('*').eq('id_compromisso', id).single();
    return data ?? null;
  }

  async list(): Promise<Compromisso[]> {
    const { data } = await supabase.from('compromisso').select('*');
    return data ?? [];
  }

  async create(data: Compromisso): Promise<Compromisso> {
    const { data: novo } = await supabase
      .from('compromisso')
      .insert({ id_evento: data.id_evento, descricao: data.descricao, data_compromisso: data.data_compromisso })
      .select().single();
    return novo!;
  }

  async update(id: EntityId, data: Partial<Compromisso>): Promise<Compromisso> {
    const { data: atualizado } = await supabase.from('compromisso').update(data).eq('id_compromisso', id).select().single();
    return atualizado!;
  }

  async remove(id: EntityId): Promise<void> {
    await supabase.from('compromisso').delete().eq('id_compromisso', id);
  }
}
