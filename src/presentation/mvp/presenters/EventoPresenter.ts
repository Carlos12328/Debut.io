import { EventoController } from '../../../application/api/controllers/EventoController';
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
  constructor(private readonly eventoController: EventoController, private readonly id_usuario: number) {}
  attachView(view: EventoView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarEventos() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.eventoController.listar(this.id_usuario);
      if (!r.sucesso) throw new Error(r.erro);
      this.view.onEventosCargados(r.dados ?? []);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao carregar eventos.'); }
    finally { this.view.hideLoading(); }
  }

  async handleCadastrarEvento(nome: string, data_evento: string, orcamento: string) {
    if (!this.view) return;
    const n = parseFloat(orcamento.replace(',', '.'));
    if (isNaN(n)) { this.view.showError('Orcamento invalido.'); return; }
    this.view.showLoading();
    try {
      const r = await this.eventoController.cadastrar(this.id_usuario, nome, data_evento, n);
      if (!r.sucesso || !r.dados) throw new Error(r.erro);
      this.view.onEventoCadastrado(r.dados);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao cadastrar evento.'); }
    finally { this.view.hideLoading(); }
  }

  async handleEditarEvento(id_evento: number, nome: string, data_evento: string, orcamento: string) {
    if (!this.view) return;
    const n = parseFloat(orcamento.replace(',', '.'));
    if (isNaN(n)) { this.view.showError('Orcamento invalido.'); return; }
    this.view.showLoading();
    try {
      const r = await this.eventoController.editar(id_evento, nome, data_evento, n);
      if (!r.sucesso || !r.dados) throw new Error(r.erro);
      this.view.onEventoAtualizado(r.dados);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao editar evento.'); }
    finally { this.view.hideLoading(); }
  }

  async handleEncerrarEvento(id_evento: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.eventoController.encerrar(id_evento);
      if (!r.sucesso || !r.dados) throw new Error(r.erro);
      this.view.onEventoEncerrado(r.dados);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao encerrar evento.'); }
    finally { this.view.hideLoading(); }
  }
}