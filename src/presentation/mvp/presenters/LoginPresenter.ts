import { Usuario } from '../../../domain/models';
import { UsuarioController } from '../../../application/api/controllers/UsuarioController';

export interface LoginView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onLoginSuccess(usuario: Usuario): void;
}

export class LoginPresenter {
  private view: LoginView | null = null;

  constructor(private readonly usuarioController: UsuarioController) {}

  attachView(view: LoginView) {
    this.view = view;
  }

  detachView() {
    this.view = null;
  }

  async handleLogin(email: string, senha: string) {
    if (!this.view) return;

    this.view.showLoading();
    try {
      const resposta = await this.usuarioController.login(email, senha);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao fazer login.');
        return;
      }
      this.view.onLoginSuccess(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao fazer login.');
    } finally {
      this.view.hideLoading();
    }
  }
}