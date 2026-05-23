import { Usuario, EntityId } from '../../domain/models';
import { UsuarioRepository } from './index';
import { supabase } from '../../lib/supabase';

export class UsuarioSupabaseRepository implements UsuarioRepository {
  async getByEmail(email: string): Promise<Usuario | null> {
    const { data } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single();
    return data ?? null;
  }

  async getById(id: EntityId): Promise<Usuario | null> {
    const { data } = await supabase
      .from('usuario')
      .select('*')
      .eq('id_usuario', id)
      .single();
    return data ?? null;
  }

  async list(): Promise<Usuario[]> {
    const { data } = await supabase.from('usuario').select('*');
    return data ?? [];
  }

  async create(data: Usuario): Promise<Usuario> {
    const { data: novo } = await supabase
      .from('usuario')
      .insert({
        nome: data.nome,
        email: data.email,
        senha_hash: data.senha_hash,
        perfil: data.perfil,
        cpf: data.cpf ?? null,
        data_nascimento: data.data_nascimento ?? null,
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

  async update(id: EntityId, data: Partial<Usuario>): Promise<Usuario> {
    const { data: atualizado } = await supabase
      .from('usuario')
      .update(data)
      .eq('id_usuario', id)
      .select()
      .single();
    return atualizado!;
  }

  async remove(id: EntityId): Promise<void> {
    await supabase.from('usuario').delete().eq('id_usuario', id);
  }
}