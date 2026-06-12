import { FornecedorController } from '../../../application/api/controllers/FornecedorController';
import { PagamentoController } from '../../../application/api/controllers/PagamentoController';
import { FinanceiroViewModel, FinanceiroFornecedorResumo } from '../models/FinanceiroViewModel';

export interface FinanceiroView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onResumoCarregado(resumo: FinanceiroViewModel): void;
}

export class FinanceiroPresenter {
  private view: FinanceiroView | null = null;

  constructor(
    private readonly fornecedorController: FornecedorController,
    private readonly pagamentoController: PagamentoController,
    private readonly id_evento: number,
  ) {}

  attachView(view: FinanceiroView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarResumo() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const [rF, rP] = await Promise.all([
        this.fornecedorController.listar(this.id_evento),
        this.pagamentoController.listarPorEvento(this.id_evento),
      ]);
      if (!rF.sucesso) throw new Error(rF.erro);
      if (!rP.sucesso) throw new Error(rP.erro);

      const fornecedores = rF.dados ?? [];
      const pagamentos = rP.dados ?? [];

      const resumos: FinanceiroFornecedorResumo[] = fornecedores.map(f => {
        const doF = pagamentos.filter(p => p.id_fornecedor === f.id_fornecedor);
        return {
          fornecedor: f,
          totalPago: doF.filter(p=>p.status==='pago').reduce((s,p)=>s+Number(p.valor),0),
          totalPendente: doF.filter(p=>p.status==='pendente').reduce((s,p)=>s+Number(p.valor),0),
          quantidadePagamentos: doF.length,
        };
      });

      this.view.onResumoCarregado({
        resumos,
        totalGeralPago: resumos.reduce((s,r)=>s+r.totalPago,0),
        totalGeralPendente: resumos.reduce((s,r)=>s+r.totalPendente,0),
      });
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao carregar financeiro.'); }
    finally { this.view.hideLoading(); }
  }
}