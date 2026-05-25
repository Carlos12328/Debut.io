import { CompromissoService } from '../../../domain/services';
import { Compromisso } from '../../../domain/models';

export interface CompromissoView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onCompromissosCarregados(compromissos: Compromisso[]): void;
  onCompromissoCadastrado(compromisso: Compromisso): void;
  onCompromissoRemovido(id: number): void;
}

export class CompromissoPresenter {
  private view: CompromissoView | null = null;

  constructor(private readonly compromissoService: CompromissoService, private readonly id_evento: number) {}

  attachView(view: CompromissoView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarCompromissos() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const lista = await this.compromissoService.listar(this.id_evento);
      this.view.onCompromissosCarregados(lista);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao carregar compromissos.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(descricao: string, data_compromisso: string) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const compromisso = await this.compromissoService.cadastrar(this.id_evento, descricao, data_compromisso);
      this.view.onCompromissoCadastrado(compromisso);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao cadastrar compromisso.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRemover(id_compromisso: number) {
    if (!this.view) return;
    try {
      await this.compromissoService.remover(id_compromisso);
      this.view.onCompromissoRemovido(id_compromisso);
    } catch (e: any) {
      this.view.showError(e.message ?? 'Erro ao remover compromisso.');
    }
  }
}
