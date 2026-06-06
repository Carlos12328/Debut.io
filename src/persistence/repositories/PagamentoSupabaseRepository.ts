import { Pagamento, EntityId } from '../../domain/models';
import { PagamentoRepository } from './index';
import { supabase } from '../../lib/supabase';

export class PagamentoSupabaseRepository implements PagamentoRepository {
  async getByFornecedor(id_fornecedor: EntityId): Promise<Pagamento[]> {
    const { data } = await supabase
      .from('pagamento')
      .select('*')
      .eq('id_fornecedor', id_fornecedor);

    return data ?? [];
  }

  async getByEvento(id_evento: EntityId): Promise<Pagamento[]> {
    const { data } = await supabase
      .from('pagamento')
      .select('*, fornecedor!inner(id_evento)')
      .eq('fornecedor.id_evento', id_evento);

    return data ?? [];
  }

  async getById(id: EntityId): Promise<Pagamento | null> {
    const { data } = await supabase
      .from('pagamento')
      .select('*')
      .eq('id_pagamento', id)
      .single();

    return data ?? null;
  }

  async list(): Promise<Pagamento[]> {
    const { data } = await supabase
      .from('pagamento')
      .select('*');

    return data ?? [];
  }

  async create(data: Pagamento): Promise<Pagamento> {
    const { data: novo } = await supabase
      .from('pagamento')
      .insert({
        id_fornecedor: data.id_fornecedor,
        valor: data.valor,
        vencimento: data.vencimento,
        status: data.status,
      })
      .select()
      .single();

    return novo!;
  }

  async update(id: EntityId, data: Partial<Pagamento>): Promise<Pagamento> {
    const { data: atualizado } = await supabase
      .from('pagamento')
      .update(data)
      .eq('id_pagamento', id)
      .select()
      .single();

    return atualizado!;
  }

  async remove(id: EntityId): Promise<void> {
    await supabase
      .from('pagamento')
      .delete()
      .eq('id_pagamento', id);
  }
}