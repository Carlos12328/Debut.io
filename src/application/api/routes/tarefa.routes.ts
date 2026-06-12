/**
 * tarefa.routes.ts — Debut.io
 * src/application/api/routes/tarefa.routes.ts
 * UC08 — Criar | UC09 — Atualizar status | UC10 — Consultar
 */
import { Router, Request, Response } from 'express';
import { TarefaController } from '../controllers';
import { TarefaServiceImpl } from '../../../domain/services/TarefaService';
import { TarefaSupabaseRepository } from '../../../persistence/repositories/TarefaSupabaseRepository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = () => new TarefaController(new TarefaServiceImpl(new TarefaSupabaseRepository()));

router.get('/evento/:id_evento', authMiddleware, async (req: Request, res: Response) => {
  const r = await ctrl().listar(Number(req.params.id_evento));
  r.sucesso ? res.json(r.dados) : res.status(400).json({ erro: r.erro });
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { id_evento, descricao, prioridade, prazo, responsavel } = req.body;
  const r = await ctrl().cadastrar(id_evento, descricao, prioridade, prazo, responsavel);
  r.sucesso ? res.status(201).json(r.dados) : res.status(400).json({ erro: r.erro });
});

router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  const { status } = req.body;
  const r = await ctrl().atualizarStatus(Number(req.params.id), status);
  r.sucesso ? res.json(r.dados) : res.status(400).json({ erro: r.erro });
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const r = await ctrl().remover(Number(req.params.id));
  r.sucesso ? res.status(204).send() : res.status(400).json({ erro: r.erro });
});

export default router;
