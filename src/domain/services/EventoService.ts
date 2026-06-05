import { Evento } from '../models/evento';
import { EventoRepository } from '../../persistence/repositories';

export interface EventoService {
  cadastrar(id_usuario: number, nome: string, data_evento: string, orcamento: number): Promise<Evento>;
  listar(id_usuario: number): Promise<Evento[]>;
  editar(id_evento: number, nome: string, data_evento: string, orcamento: number): Promise<Evento>;
  encerrar(id_evento: number): Promise<Evento>;
}

export class EventoServiceImpl implements EventoService {
  constructor(private readonly eventoRepository: EventoRepository) {}

  async cadastrar(id_usuario: number, nome: string, data_evento: string, orcamento: number): Promise<Evento> {
    if (!nome) throw new Error('O nome do evento e obrigatorio.');
    if (!data_evento) throw new Error('A data do evento e obrigatoria.');
    if (orcamento <= 0) throw new Error('O orcamento deve ser maior que zero.');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (new Date(data_evento) < hoje) throw new Error('A data do evento nao pode ser uma data passada.');
    return await this.eventoRepository.create({ id_evento: 0, id_usuario, nome, data_evento, orcamento, status: 'ativo' });
  }

  async listar(id_usuario: number): Promise<Evento[]> {
    return await this.eventoRepository.getByUsuario(id_usuario);
  }

  async editar(id_evento: number, nome: string, data_evento: string, orcamento: number): Promise<Evento> {
    if (!nome) throw new Error('O nome do evento e obrigatorio.');
    if (!data_evento) throw new Error('A data do evento e obrigatoria.');
    if (orcamento <= 0) throw new Error('O orcamento deve ser maior que zero.');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (new Date(data_evento) < hoje) throw new Error('A data do evento nao pode ser uma data passada.');
    return await this.eventoRepository.update(id_evento, { nome, data_evento, orcamento });
  }

  async encerrar(id_evento: number): Promise<Evento> {
    return await this.eventoRepository.update(id_evento, { status: 'encerrado' });
  }
}
