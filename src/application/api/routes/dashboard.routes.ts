/**
 * dashboard.routes.ts — Debut.io
 * src/application/api/routes/dashboard.routes.ts
 * UC14 — Dashboard financeiro | UC15 — Visão geral
 */
import { Router, Request, Response } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { TarefaServiceImpl } from '../../../domain/services/TarefaService';
import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { CompromissoServiceImpl } from '../../../domain/services/CompromissoService';
import { FornecedorServiceImpl } from '../../../domain/services/FornecedorService';
import { TarefaSupabaseRepository } from '../../../persistence/repositories/TarefaSupabaseRepository';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { CompromissoSupabaseRepository } from '../../../persistence/repositories/CompromissoSupabaseRepository';
import { FornecedorSupabaseRepository } from '../../../persistence/repositories/FornecedorSupabaseRepository';
import { EventoSupabaseRepository } from '../../../persistence/repositories/EventoSupabaseRepository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

function getController() {
  return new DashboardController(
    new PagamentoServiceImpl(new PagamentoSupabaseRepository()),
    new TarefaServiceImpl(new TarefaSupabaseRepository()),
  );
}

router.get('/:id_evento', authMiddleware, async (req: Request, res: Response) => {
  const id_evento = Number(req.params.id_evento);

  const r = await getController().obterResumo(id_evento);
  r.sucesso
    ? res.status(200).json(r.dados)
    : res.status(400).json({ erro: r.erro });
});

export default router;
