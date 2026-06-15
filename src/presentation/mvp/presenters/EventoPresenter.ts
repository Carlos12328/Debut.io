import { EventoService } from '../../../domain/services';
import { Evento } from '../../../domain/models';

export interface EventoView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onEventosCargados(eventos: Evento[]): void;
  onEventoCadastrado(evento: Evento): void;
  onEventoAtualizado(evento: Evento): void;
  onEventoEncerrado(evento: Evento): void;
}

export class EventoPresenter {
  private view: EventoView | null = null;

  constructor(
    private readonly eventoService: EventoService,
    private readonly id_usuario: number
  ) {}

  attachView(view: EventoView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarEventos() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const eventos = await this.eventoService.listar(this.id_usuario);
      this.view.onEventosCargados(eventos);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao carregar eventos.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrarEvento(nome: string, data_evento: string, orcamento: string) {
    if (!this.view) return;
    const orcamentoNum = parseFloat(orcamento.replace(',', '.'));
    if (isNaN(orcamentoNum)) {
      this.view.showError('Orcamento invalido.');
      return;
    }
    this.view.showLoading();
    try {
      const evento = await this.eventoService.cadastrar(this.id_usuario, nome, data_evento, orcamentoNum);
      this.view.onEventoCadastrado(evento);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao cadastrar evento.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleEditarEvento(id_evento: number, nome: string, data_evento: string, orcamento: string) {
    if (!this.view) return;
    const orcamentoNum = parseFloat(orcamento.replace(',', '.'));
    if (isNaN(orcamentoNum)) {
      this.view.showError('Orcamento invalido.');
      return;
    }
    this.view.showLoading();
    try {
      const evento = await this.eventoService.editar(id_evento, nome, data_evento, orcamentoNum);
      this.view.onEventoAtualizado(evento);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao editar evento.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleEncerrarEvento(id_evento: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const evento = await this.eventoService.encerrar(id_evento);
      this.view.onEventoEncerrado(evento);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao encerrar evento.');
    } finally {
      this.view.hideLoading();
    }
  }
}