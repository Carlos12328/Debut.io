import { AuthController } from '../../../application/api/controllers/AuthController';

export interface RecuperacaoSenhaView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onEmailVerificado(): void;
  onSenhaRedefinida(): void;
}

export class RecuperacaoSenhaPresenter {
  private view: RecuperacaoSenhaView | null = null;

  constructor(private readonly controller: AuthController) {}

  attachView(view: RecuperacaoSenhaView) {
    this.view = view;
  }

  detachView() {
    this.view = null;
  }

  async handleVerificarEmail(email: string) {
    if (!this.view) return;

    this.view.showLoading();
    try {
      await this.controller.verificarEmail(email);

      // Agora não vai direto pra nova senha
      this.view.onEmailVerificado();

    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao verificar e-mail.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRedefinirSenha(novaSenha: string, confirmarSenha: string) {
    if (!this.view) return;

    if (novaSenha !== confirmarSenha) {
      this.view.showError('As senhas não coincidem.');
      return;
    }

    this.view.showLoading();
    try {
      await this.controller.redefinirSenha(novaSenha);
      this.view.onSenhaRedefinida();
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao redefinir senha.');
    } finally {
      this.view.hideLoading();
    }
  }
}