/**
 * pagamento.routes.ts — Debut.io
 * src/application/api/routes/pagamento.routes.ts
 *
 * Rotas Express do módulo financeiro.
 * UC06 — Registrar | UC07 — Consultar
 * RN-001: controle de orçamento (tratado no Service)
 */
import { Router, Request, Response } from 'express';
import { FinanceiroController } from '../controllers/FinanceiroController';
import { PagamentoServiceImpl }  from '../../../domain/services/PagamentoService';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

function getController() {
  return new FinanceiroController(
    new PagamentoServiceImpl(new PagamentoSupabaseRepository()),
  );
}

/** UC07 — Listar pagamentos de um fornecedor */
router.get('/fornecedor/:id_fornecedor', authMiddleware, async (req: Request, res: Response) => {
  const { sucesso, dados, erro } = await getController().listarPorFornecedor(
    Number(req.params.id_fornecedor),
  );
  sucesso ? res.status(200).json(dados) : res.status(400).json({ erro });
});

/** UC06 — Registrar pagamento */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { id_fornecedor, valor, vencimento } = req.body;
  if (!id_fornecedor || !valor || !vencimento)
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  const { sucesso, dados, erro } = await getController().registrar(id_fornecedor, valor, vencimento);
  sucesso ? res.status(201).json(dados) : res.status(400).json({ erro });
});

/** RN-002 — Marcar como pago */
router.patch('/:id/pagar', authMiddleware, async (req: Request, res: Response) => {
  const { sucesso, dados, erro } = await getController().pagar(Number(req.params.id));
  sucesso ? res.status(200).json(dados) : res.status(400).json({ erro });
});

/** Remover pagamento */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { sucesso, erro } = await getController().remover(Number(req.params.id));
  sucesso ? res.status(204).send() : res.status(400).json({ erro });
});

export default router;
