import { AuthController } from '../../../application/api/controllers/AuthController';

export interface RecuperacaoSenhaView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;

  onCodigoGerado(codigo: string): void;
  onCodigoValidado(): void;
  onSenhaRedefinida(): void;
}

export class RecuperacaoSenhaPresenter {
  private view: RecuperacaoSenhaView | null = null;

  constructor(
    private readonly controller: AuthController
  ) {}

  attachView(view: RecuperacaoSenhaView) {
    this.view = view;
  }

  detachView() {
    this.view = null;
  }

  async handleVerificarEmail(
    email: string
  ) {
    if (!this.view) return;

    this.view.showLoading();

    try {
      const codigo =
        await this.controller
          .verificarEmail(email);

      this.view.onCodigoGerado(
        codigo
      );

    } catch (error: any) {
      this.view.showError(
        error.message ??
        'Erro ao verificar e-mail.'
      );
    } finally {
      this.view.hideLoading();
    }
  }

  handleValidarCodigo(
    codigo: string
  ) {
    if (!this.view) return;

    const valido =
      this.controller
        .validarCodigo(codigo);

    if (!valido) {
      this.view.showError(
        'Código inválido.'
      );
      return;
    }

    this.view.onCodigoValidado();
  }

  async handleRedefinirSenha(
    novaSenha: string,
    confirmarSenha: string
  ) {
    if (!this.view) return;

    if (novaSenha !== confirmarSenha) {
      this.view.showError(
        'As senhas não coincidem.'
      );
      return;
    }

    this.view.showLoading();

    try {
      await this.controller
        .redefinirSenha(
          novaSenha
        );

      this.view
        .onSenhaRedefinida();

    } catch (error: any) {
      this.view.showError(
        error.message ??
        'Erro ao redefinir senha.'
      );
    } finally {
      this.view.hideLoading();
    }
  }
}
