import { EventoServiceImpl } from '../../../domain/services/EventoService';
import { Evento } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export class EventoController {
  constructor(private readonly eventoService: EventoServiceImpl) {}

  async cadastrar(id_usuario: number, nome: string, data_evento: string, orcamento: number): Promise<ResultadoOperacao<Evento>> {
    try {
      const evento = await this.eventoService.cadastrar(id_usuario, nome, data_evento, orcamento);
      return { sucesso: true, dados: evento };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }

  async listar(id_usuario: number): Promise<ResultadoOperacao<Evento[]>> {
    try {
      const eventos = await this.eventoService.listar(id_usuario);
      return { sucesso: true, dados: eventos };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }

  async editar(id_evento: number, nome: string, data_evento: string, orcamento: number): Promise<ResultadoOperacao<Evento>> {
    try {
      const evento = await this.eventoService.editar(id_evento, nome, data_evento, orcamento);
      return { sucesso: true, dados: evento };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }

  async encerrar(id_evento: number): Promise<ResultadoOperacao<Evento>> {
    try {
      const evento = await this.eventoService.encerrar(id_evento);
      return { sucesso: true, dados: evento };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }
}