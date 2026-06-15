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
    const { data } = await supabase
      .from('usuario')
      .select('*');

    return data ?? [];
  }

  async create(data: Usuario): Promise<Usuario> {
    const { data: novo, error } = await supabase
      .from('usuario')
      .insert({
        nome: data.nome,
        email: data.email,
        senha_hash: data.senha_hash,
        perfil: data.perfil,
        cpf: data.cpf,
        data_nascimento: data.data_nascimento,
        endereco_logradouro: data.endereco_logradouro ?? null,
        endereco_numero: data.endereco_numero ?? null,
        endereco_bairro: data.endereco_bairro ?? null,
        endereco_cidade: data.endereco_cidade ?? null,
        endereco_estado: data.endereco_estado ?? null,
        endereco_cep: data.endereco_cep ?? null,
      })
      .select()
      .single();

    if (error) {
      const mensagem = error.message.toLowerCase();

      if (error.code === '23505' && mensagem.includes('email')) {
        throw new Error('Ja existe uma conta com este e-mail.');
      }

      if (error.code === '23505' && mensagem.includes('cpf')) {
        throw new Error('Ja existe uma conta com este CPF.');
      }

      if (error.code === '23502') {
        throw new Error('Preencha todos os campos obrigatorios.');
      }

      throw new Error('Erro ao cadastrar usuario.');
    }

    if (!novo) {
      throw new Error('Erro ao cadastrar usuario.');
    }

    return novo;
  }

  async update(id: EntityId, data: Partial<Usuario>): Promise<Usuario> {
    const { data: atualizado, error } = await supabase
      .from('usuario')
      .update(data)
      .eq('id_usuario', id)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao atualizar usuario.');
    }

    if (!atualizado) {
      throw new Error('Usuario nao encontrado.');
    }

    return atualizado;
  }

  async remove(id: EntityId): Promise<void> {
    const { error } = await supabase
      .from('usuario')
      .delete()
      .eq('id_usuario', id);

    if (error) {
      throw new Error('Erro ao remover usuario.');
    }
  }
}
