import { Fornecedor, EntityId } from '../../domain/models';
import { FornecedorRepository } from './index';
import { supabase } from '../../lib/supabase';

export class FornecedorSupabaseRepository implements FornecedorRepository {
  async getByEvento(id_evento: EntityId): Promise<Fornecedor[]> {
    const { data } = await supabase
      .from('fornecedor')
      .select('*')
      .eq('id_evento', id_evento);
    return data ?? [];
  }

  async getById(id: EntityId): Promise<Fornecedor | null> {
    const { data } = await supabase
      .from('fornecedor')
      .select('*')
      .eq('id_fornecedor', id)
      .single();
    return data ?? null;
  }

  async list(): Promise<Fornecedor[]> {
    const { data } = await supabase.from('fornecedor').select('*');
    return data ?? [];
  }

  async create(data: Fornecedor): Promise<Fornecedor> {
    const { data: novo } = await supabase
      .from('fornecedor')
      .insert({
        id_evento: data.id_evento,
        nome: data.nome,
        tipo_servico: data.tipo_servico,
        valor: data.valor,
        cnpj: data.cnpj ?? null,
        telefone: data.telefone ?? null,
        email: data.email ?? null,
        endereco_logradouro: data.endereco_logradouro ?? null,
        endereco_numero: data.endereco_numero ?? null,
        endereco_bairro: data.endereco_bairro ?? null,
        endereco_cidade: data.endereco_cidade ?? null,
        endereco_estado: data.endereco_estado ?? null,
        endereco_cep: data.endereco_cep ?? null,
      })
      .select()
      .single();
    return novo!;
  }

  async update(id: EntityId, data: Partial<Fornecedor>): Promise<Fornecedor> {
    const { data: atualizado } = await supabase
      .from('fornecedor')
      .update(data)
      .eq('id_fornecedor', id)
      .select()
      .single();
    return atualizado!;
  }

  async remove(id: EntityId): Promise<void> {
    await supabase.from('fornecedor').delete().eq('id_fornecedor', id);
  }
}