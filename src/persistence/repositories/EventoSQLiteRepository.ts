import { Evento, EntityId } from '../../domain/models';
import { EventoRepository } from './index';
import { getDatabase } from '../db';

export class EventoSQLiteRepository implements EventoRepository {
  async getByUsuario(id_usuario: EntityId): Promise<Evento[]> {
    const db = await getDatabase();
    return db.getAllSync<Evento>(
      'SELECT * FROM evento WHERE id_usuario = ?',
      [id_usuario]
    );
  }

  async getById(id: EntityId): Promise<Evento | null> {
    const db = await getDatabase();
    const result = db.getFirstSync<Evento>(
      'SELECT * FROM evento WHERE id_evento = ?',
      [id]
    );
    return result ?? null;
  }

  async list(): Promise<Evento[]> {
    const db = await getDatabase();
    return db.getAllSync<Evento>('SELECT * FROM evento');
  }

  async create(data: Evento): Promise<Evento> {
    const db = await getDatabase();
    db.runSync(
      'INSERT INTO evento (id_usuario, nome, data_evento, orcamento, status) VALUES (?, ?, ?, ?, ?)',
      [data.id_usuario, data.nome, data.data_evento, data.orcamento, data.status]
    );
    const eventos = await this.getByUsuario(data.id_usuario);
    return eventos[eventos.length - 1];
  }

  async update(id: EntityId, data: Partial<Evento>): Promise<Evento> {
    const db = await getDatabase();
    const campos = Object.keys(data).map((k) => `${k} = ?`).join(', ');
    const valores = [...Object.values(data), id];
    db.runSync(`UPDATE evento SET ${campos} WHERE id_evento = ?`, valores);
    return (await this.getById(id))!;
  }

  async remove(id: EntityId): Promise<void> {
    const db = await getDatabase();
    db.runSync('DELETE FROM evento WHERE id_evento = ?', [id]);
  }
}
