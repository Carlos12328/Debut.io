import { Usuario, EntityId } from '../../domain/models';
import { UsuarioRepository } from './index';
import { getDatabase } from '../db';

export class UsuarioSQLiteRepository implements UsuarioRepository {
  async getByEmail(email: string): Promise<Usuario | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuario WHERE email = ?',
      [email]
    );
    return result ?? null;
  }

  async getById(id: EntityId): Promise<Usuario | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuario WHERE id_usuario = ?',
      [id]
    );
    return result ?? null;
  }

  async list(): Promise<Usuario[]> {
    const db = await getDatabase();
    return db.getAllAsync<Usuario>('SELECT * FROM usuario');
  }

  async create(data: Usuario): Promise<Usuario> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO usuario 
        (nome, email, senha_hash, perfil, cpf, data_nascimento,
         endereco_logradouro, endereco_numero, endereco_bairro,
         endereco_cidade, endereco_estado, endereco_cep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.nome,
        data.email,
        data.senha_hash,
        data.perfil,
        data.cpf ?? null,
        data.data_nascimento ?? null,
        data.endereco_logradouro ?? null,
        data.endereco_numero ?? null,
        data.endereco_bairro ?? null,
        data.endereco_cidade ?? null,
        data.endereco_estado ?? null,
        data.endereco_cep ?? null,
      ]
    );
    const novo = await this.getByEmail(data.email);
    return novo!;
  }

  async update(id: EntityId, data: Partial<Usuario>): Promise<Usuario> {
    const db = await getDatabase();
    const campos = Object.keys(data).map((k) => `${k} = ?`).join(', ');
    const valores = [...Object.values(data), id];
    await db.runAsync(`UPDATE usuario SET ${campos} WHERE id_usuario = ?`, valores);
    return (await this.getById(id))!;
  }

  async remove(id: EntityId): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM usuario WHERE id_usuario = ?', [id]);
  }
}