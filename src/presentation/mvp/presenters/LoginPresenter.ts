import { AuthService } from '../../../domain/services';
import { Usuario } from '../../../domain/models';

export interface LoginView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onLoginSuccess(usuario: Usuario): void;
}

export class LoginPresenter {
  private view: LoginView | null = null;

  constructor(private readonly authService: AuthService) {}

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
      const usuario = await this.authService.login(email, senha);
      this.view.onLoginSuccess(usuario);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao fazer login.');
    } finally {
      this.view.hideLoading();
    }
  }
}