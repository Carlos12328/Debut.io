import { CadastroService } from '../../../domain/services';
import { Usuario, PerfilUsuario } from '../../../domain/models';

export interface CadastroView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onCadastroSuccess(usuario: Usuario): void;
}

export class CadastroPresenter {
  private view: CadastroView | null = null;

  constructor(private readonly cadastroService: CadastroService) {}

  attachView(view: CadastroView) { this.view = view; }
  detachView() { this.view = null; }

  async handleCadastro(
    nome: string,
    email: string,
    senha: string,
    confirmarSenha: string,
    perfil: PerfilUsuario
  ) {
    if (!this.view) return;
    if (senha !== confirmarSenha) {
      this.view.showError('As senhas não coincidem.');
      return;
    }
    this.view.showLoading();
    try {
      const usuario = await this.cadastroService.cadastrar(nome, email, senha, perfil);
      this.view.onCadastroSuccess(usuario);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao cadastrar.');
    } finally {
      this.view.hideLoading();
    }
  }
}
