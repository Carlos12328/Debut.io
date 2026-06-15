import { Evento } from '../../../domain/models';
import { EventoController } from '../../../application/api/controllers/EventoController';

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
    private readonly eventoController: EventoController,
    private readonly id_usuario: number
  ) {}

  attachView(view: EventoView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarEventos() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const resposta = await this.eventoController.listar(this.id_usuario);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao carregar eventos.');
        return;
      }
      this.view.onEventosCargados(resposta.dados);
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
      const resposta = await this.eventoController.cadastrar(this.id_usuario, nome, data_evento, orcamentoNum);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao cadastrar evento.');
        return;
      }
      this.view.onEventoCadastrado(resposta.dados);
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
      const resposta = await this.eventoController.editar(id_evento, nome, data_evento, orcamentoNum);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao editar evento.');
        return;
      }
      this.view.onEventoAtualizado(resposta.dados);
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
      const resposta = await this.eventoController.encerrar(id_evento);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao encerrar evento.');
        return;
      }
      this.view.onEventoEncerrado(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao encerrar evento.');
    } finally {
      this.view.hideLoading();
    }
  }
}