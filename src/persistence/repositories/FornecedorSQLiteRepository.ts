import { Fornecedor, EntityId } from '../../domain/models';
import { FornecedorRepository } from './index';
import { getDatabase } from '../db';

export class FornecedorSQLiteRepository implements FornecedorRepository {
  async getByEvento(id_evento: EntityId): Promise<Fornecedor[]> {
    const db = await getDatabase();
    return db.getAllAsync<Fornecedor>(
      'SELECT * FROM fornecedor WHERE id_evento = ?',
      [id_evento]
    );
  }

  async getById(id: EntityId): Promise<Fornecedor | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Fornecedor>(
      'SELECT * FROM fornecedor WHERE id_fornecedor = ?',
      [id]
    );
    return result ?? null;
  }

  async list(): Promise<Fornecedor[]> {
    const db = await getDatabase();
    return db.getAllAsync<Fornecedor>('SELECT * FROM fornecedor');
  }

  async create(data: Fornecedor): Promise<Fornecedor> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO fornecedor
        (id_evento, nome, tipo_servico, valor, cnpj, telefone, email,
         endereco_logradouro, endereco_numero, endereco_bairro,
         endereco_cidade, endereco_estado, endereco_cep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_evento,
        data.nome,
        data.tipo_servico,
        data.valor,
        data.cnpj ?? null,
        data.telefone ?? null,
        data.email ?? null,
        data.endereco_logradouro ?? null,
        data.endereco_numero ?? null,
        data.endereco_bairro ?? null,
        data.endereco_cidade ?? null,
        data.endereco_estado ?? null,
        data.endereco_cep ?? null,
      ]
    );
    const lista = await this.getByEvento(data.id_evento);
    return lista[lista.length - 1];
  }

  async update(id: EntityId, data: Partial<Fornecedor>): Promise<Fornecedor> {
    const db = await getDatabase();
    const campos = Object.keys(data).map((k) => `${k} = ?`).join(', ');
    const valores = [...Object.values(data), id];
    await db.runAsync(
      `UPDATE fornecedor SET ${campos} WHERE id_fornecedor = ?`,
      valores
    );
    return (await this.getById(id))!;
  }

  async remove(id: EntityId): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM fornecedor WHERE id_fornecedor = ?', [id]);
  }
}