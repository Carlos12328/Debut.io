import { Fornecedor } from '../../../domain/models';
import { FornecedorController } from '../../../application/api/controllers/FornecedorController';

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

  constructor(
    private readonly fornecedorController: FornecedorController,
    private readonly id_evento: number
  ) {}

  attachView(view: FornecedorView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarFornecedores() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const resposta = await this.fornecedorController.listar(this.id_evento);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao carregar fornecedores.');
        return;
      }
      this.view.onFornecedoresCarregados(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao carregar fornecedores.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(
    nome: string,
    tipo_servico: string,
    valor: string,
    cnpj?: string,
    telefone?: string,
    email?: string,
    endereco_logradouro?: string,
    endereco_numero?: string,
    endereco_bairro?: string,
    endereco_cidade?: string,
    endereco_estado?: string,
    endereco_cep?: string,
  ) {
    if (!this.view) return;
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum)) {
      this.view.showError('Valor inválido.');
      return;
    }
    this.view.showLoading();
    try {
      const resposta = await this.fornecedorController.cadastrar(
        this.id_evento, nome, tipo_servico, valorNum,
        cnpj, telefone, email,
        endereco_logradouro, endereco_numero, endereco_bairro,
        endereco_cidade, endereco_estado, endereco_cep,
      );
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao cadastrar fornecedor.');
        return;
      }
      this.view.onFornecedorCadastrado(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao cadastrar fornecedor.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRemover(id_fornecedor: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const resposta = await this.fornecedorController.remover(id_fornecedor);
      if (!resposta.sucesso) {
        this.view.showError(resposta.erro ?? 'Erro ao remover fornecedor.');
        return;
      }
      this.view.onFornecedorRemovido(id_fornecedor);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao remover fornecedor.');
    } finally {
      this.view.hideLoading();
    }
  }
}