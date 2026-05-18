import { EventoService } from '../../../domain/services';
import { Evento } from '../../../domain/models';

export interface EventoView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onEventosCargados(eventos: Evento[]): void;
  onEventoCadastrado(evento: Evento): void;
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
      this.view.showError('Orçamento inválido.');
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
}
