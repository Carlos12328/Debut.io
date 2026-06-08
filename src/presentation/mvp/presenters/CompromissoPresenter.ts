import { CompromissoController } from '../../../application/api/controllers/CompromissoController';
import { Compromisso } from '../../../domain/models';

export interface CompromissoView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onCompromissosCarregados(
    compromissos: Compromisso[],
  ): void;
  onCompromissoCadastrado(
    compromisso: Compromisso,
  ): void;
  onCompromissoRemovido(
    id: number,
  ): void;
}

export class CompromissoPresenter {
  private view:
    CompromissoView | null = null;

  constructor(
    private readonly compromissoController:
      CompromissoController,
    private readonly id_evento: number,
  ) {}

  attachView(view: CompromissoView) {
    this.view = view;
  }

  detachView() {
    this.view = null;
  }

  async carregarCompromissos() {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const response =
        await this.compromissoController
          .listar(this.id_evento);

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view
        .onCompromissosCarregados(
          response.dados ?? [],
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
        'Erro ao carregar compromissos.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(
    descricao: string,
    data_compromisso: string,
  ) {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const response =
        await this.compromissoController
          .cadastrar(
            this.id_evento,
            descricao,
            data_compromisso,
          );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view
        .onCompromissoCadastrado(
          response.dados!,
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
        'Erro ao cadastrar compromisso.',
      );
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRemover(
    id_compromisso: number,
  ) {
    if (!this.view) return;

    try {
      const response =
        await this.compromissoController
          .remover(
            id_compromisso,
          );

      if (!response.sucesso) {
        throw new Error(response.erro);
      }

      this.view
        .onCompromissoRemovido(
          id_compromisso,
        );
    } catch (e: any) {
      this.view.showError(
        e.message ??
        'Erro ao remover compromisso.',
      );
    }
  }
}
