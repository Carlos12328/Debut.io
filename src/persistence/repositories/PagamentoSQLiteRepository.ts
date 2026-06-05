import { Pagamento, EntityId } from '../../domain/models';
import { PagamentoRepository } from './index';
import { getDatabase } from '../db';

export class PagamentoSQLiteRepository implements PagamentoRepository {
  async getById(id: EntityId): Promise<Pagamento | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Pagamento>('SELECT * FROM pagamento WHERE id_pagamento = ?', [id]);
    return result ?? null;
  }

  async list(): Promise<Pagamento[]> {
    const db = await getDatabase();
    return db.getAllAsync<Pagamento>('SELECT * FROM pagamento');
  }

  async create(data: Pagamento): Promise<Pagamento> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO pagamento (id_fornecedor, valor, vencimento, status) VALUES (?, ?, ?, ?)',
      [data.id_fornecedor, data.valor, data.vencimento, data.status]
    );
    const lista = await this.list();
    return lista[lista.length - 1];
  }

  async update(id: EntityId, data: Partial<Pagamento>): Promise<Pagamento> {
    const db = await getDatabase();
    const chaves = Object.keys(data);
    const valores = Object.values(data);
    const campos = chaves.map((k) => `${k} = ?`).join(', ');
    await db.runAsync(`UPDATE pagamento SET ${campos} WHERE id_pagamento = ?`, [...valores, id]);
    return (await this.getById(id))!;
  }

  async remove(id: EntityId): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pagamento WHERE id_pagamento = ?', [id]);
  }
}
