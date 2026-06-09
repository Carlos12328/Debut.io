/**
 * DashboardController.ts — Debut.io
 * src/application/api/controllers/DashboardController.ts
 *
 * UC14 — Dashboard financeiro | UC15 — Visão geral
 *
 * Recebe o Evento diretamente (já disponível na Screen) para evitar
 * uma query extra de eventoService.listar().
 * Usa Promise.all — 3 queries em paralelo (RNF01: resposta < 2s).
 * Usa pagamentoService.listarPorEvento (1 query via JOIN Supabase).
 *
 * `sucesso: true as const` e `sucesso: false as const` garantem
 * que o TypeScript estreite corretamente o union type no Presenter.
 */
import { EventoServiceImpl }      from '../../../domain/services/EventoService';
import { TarefaServiceImpl }      from '../../../domain/services/TarefaService';
import { PagamentoServiceImpl }   from '../../../domain/services/PagamentoService';
import { CompromissoServiceImpl } from '../../../domain/services/CompromissoService';
import { FornecedorServiceImpl }  from '../../../domain/services/FornecedorService';
import type { Evento }            from '../../../domain/models';

export class DashboardController {
  constructor(
    private readonly tarefaService:      TarefaServiceImpl,
    private readonly pagamentoService:   PagamentoServiceImpl,
    private readonly compromissoService: CompromissoServiceImpl,
    private readonly fornecedorService:  FornecedorServiceImpl,
  ) {}

  async carregarDashboard(evento: Evento) {
    try {
      // 3 queries em paralelo — sem EventoService (já temos o evento)
      const [tarefas, compromissos, fornecedores] = await Promise.all([
        this.tarefaService.listar(evento.id_evento),
        this.compromissoService.listar(evento.id_evento),
        this.fornecedorService.listar(evento.id_evento),
      ]);

      // JOIN direto no Supabase — usa listarPorEvento corrigido
      const pagamentos = await this.pagamentoService.listarPorEvento(evento.id_evento);

      return {
        sucesso: true as const,
        dados:   { evento, tarefas, pagamentos, compromissos, fornecedores },
      };
    } catch (e: any) {
      return { sucesso: false as const, erro: e.message as string };
    }
  }
}
