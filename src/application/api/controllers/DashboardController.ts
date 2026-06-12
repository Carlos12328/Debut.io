import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { TarefaServiceImpl } from '../../../domain/services/TarefaService';
import { Pagamento, Tarefa } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export interface DashboardResumo { pagamentos: Pagamento[]; tarefas: Tarefa[]; }

export class DashboardController {
  constructor(
    private readonly pagamentoService: PagamentoServiceImpl,
    private readonly tarefaService: TarefaServiceImpl,
  ) {}

  async obterResumo(id_evento: number): Promise<ResultadoOperacao<DashboardResumo>> {
    try {
      const [pagamentos, tarefas] = await Promise.all([
        this.pagamentoService.listarPorEvento(id_evento),
        this.tarefaService.listar(id_evento),
      ]);
      return { sucesso: true, dados: { pagamentos, tarefas } };
    } catch (e: any) { return { sucesso: false, erro: e.message }; }
  }
}