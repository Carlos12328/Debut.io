import { FornecedorController } from '../../../application/api/controllers/FornecedorController';
import { Fornecedor } from '../../../domain/models';

export interface FornecedorView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onFornecedoresCarregados(fornecedores: Fornecedor[]): void;
  onFornecedorCadastrado(fornecedor: Fornecedor): void;
  onFornecedorRemovido(id: number): void;
}

export class FornecedorPresenter {
  private view: FornecedorView | null = null;
  constructor(private readonly fornecedorController: FornecedorController, private readonly id_evento: number) {}
  attachView(view: FornecedorView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarFornecedores() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.fornecedorController.listar(this.id_evento);
      if (!r.sucesso) throw new Error(r.erro);
      this.view.onFornecedoresCarregados(r.dados ?? []);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao carregar fornecedores.'); }
    finally { this.view.hideLoading(); }
  }

  async handleCadastrar(
    nome: string, tipo_servico: string, valor: string,
    cnpj?: string, telefone?: string, email?: string,
    endereco_logradouro?: string, endereco_numero?: string, endereco_bairro?: string,
    endereco_cidade?: string, endereco_estado?: string, endereco_cep?: string,
  ) {
    if (!this.view) return;
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum)) { this.view.showError('Valor invalido.'); return; }
    this.view.showLoading();
    try {
      const r = await this.fornecedorController.cadastrar(
        this.id_evento, nome, tipo_servico, valorNum,
        cnpj, telefone, email,
        endereco_logradouro, endereco_numero, endereco_bairro,
        endereco_cidade, endereco_estado, endereco_cep,
      );
      if (!r.sucesso || !r.dados) throw new Error(r.erro);
      this.view.onFornecedorCadastrado(r.dados);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao cadastrar fornecedor.'); }
    finally { this.view.hideLoading(); }
  }

  async handleRemover(id_fornecedor: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.fornecedorController.remover(id_fornecedor);
      if (!r.sucesso) throw new Error(r.erro);
      this.view.onFornecedorRemovido(id_fornecedor);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao remover fornecedor.'); }
    finally { this.view.hideLoading(); }
  }
}