import { Evento, EntityId } from '../../domain/models';
import { EventoRepository } from './index';
import { supabase } from '../../lib/supabase';

export class EventoSupabaseRepository implements EventoRepository {
  async getByUsuario(id_usuario: EntityId): Promise<Evento[]> {
    const { data } = await supabase
      .from('evento')
      .select('*')
      .eq('id_usuario', id_usuario);
    return data ?? [];
  }

  async getById(id: EntityId): Promise<Evento | null> {
    const { data } = await supabase
      .from('evento')
      .select('*')
      .eq('id_evento', id)
      .single();
    return data ?? null;
  }

  async list(): Promise<Evento[]> {
    const { data } = await supabase.from('evento').select('*');
    return data ?? [];
  }

  async create(data: Evento): Promise<Evento> {
    const { data: novo } = await supabase
      .from('evento')
      .insert({
        id_usuario: data.id_usuario,
        nome: data.nome,
        data_evento: data.data_evento,
        orcamento: data.orcamento,
        status: data.status,
      })
      .select()
      .single();
    return novo!;
  }

  async update(id: EntityId, data: Partial<Evento>): Promise<Evento> {
    const { data: atualizado } = await supabase
      .from('evento')
      .update(data)
      .eq('id_evento', id)
      .select()
      .single();
    return atualizado!;
  }

  async remove(id: EntityId): Promise<void> {
    await supabase.from('evento').delete().eq('id_evento', id);
  }
}