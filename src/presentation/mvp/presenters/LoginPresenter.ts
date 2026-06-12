import { UsuarioController } from '../../../application/api/controllers/UsuarioController';
import { Usuario } from '../../../domain/models';

export interface LoginView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onLoginSuccess(usuario: Usuario): void;
}

export class LoginPresenter {
  private view: LoginView | null = null;
  constructor(private readonly usuarioController: UsuarioController) {}
  attachView(view: LoginView) { this.view = view; }
  detachView() { this.view = null; }

  async handleLogin(email: string, senha: string) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const response = await this.usuarioController.login(email, senha);
      if (!response.sucesso || !response.dados) throw new Error(response.erro ?? 'Erro ao fazer login.');
      this.view.onLoginSuccess(response.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao fazer login.');
    } finally { this.view.hideLoading(); }
  }
}