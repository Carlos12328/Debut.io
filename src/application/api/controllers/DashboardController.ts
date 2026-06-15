import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { TarefaServiceImpl } from '../../../domain/services/TarefaService';
import { CompromissoServiceImpl } from '../../../domain/services/CompromissoService';
import { Pagamento, Tarefa, Compromisso } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export interface DashboardResumo { pagamentos: Pagamento[]; tarefas: Tarefa[]; compromissos: Compromisso[]; }

export class DashboardController {
  constructor(
    private readonly pagamentoService: PagamentoServiceImpl,
    private readonly tarefaService: TarefaServiceImpl,
    private readonly compromissoService: CompromissoServiceImpl,
  ) {}

  async obterResumo(id_evento: number): Promise<ResultadoOperacao<DashboardResumo>> {
    try {
      const [pagamentos, tarefas, compromissos] = await Promise.all([
        this.pagamentoService.listarPorEvento(id_evento),
        this.tarefaService.listar(id_evento),
        this.compromissoService.listar(id_evento),
      ]);
      return { sucesso: true, dados: { pagamentos, tarefas, compromissos } };
    } catch (e: any) { return { sucesso: false, erro: e.message }; }
  }
}
