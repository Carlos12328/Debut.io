/**
 * compromisso.routes.ts — Debut.io
 * src/application/api/routes/compromisso.routes.ts
 * UC11 — Registrar | UC12 — Consultar
 */
import { Router, Request, Response } from 'express';
import { CompromissoController } from '../controllers/CompromissoController';
import { CompromissoServiceImpl } from '../../../domain/services/CompromissoService';
import { CompromissoSupabaseRepository } from '../../../persistence/repositories/CompromissoSupabaseRepository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = () => new CompromissoController(new CompromissoServiceImpl(new CompromissoSupabaseRepository()));

router.get('/evento/:id_evento', authMiddleware, async (req: Request, res: Response) => {
  const r = await ctrl().listar(Number(req.params.id_evento));
  r.sucesso ? res.json(r.dados) : res.status(400).json({ erro: r.erro });
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { id_evento, descricao, data_compromisso } = req.body;
  const r = await ctrl().cadastrar(id_evento, descricao, data_compromisso);
  r.sucesso ? res.status(201).json(r.dados) : res.status(400).json({ erro: r.erro });
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const r = await ctrl().remover(Number(req.params.id));
  r.sucesso ? res.status(204).send() : res.status(400).json({ erro: r.erro });
});

export default router;
