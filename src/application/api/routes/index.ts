/**
 * index.ts — Debut.io
 * src/application/api/routes/index.ts
 *
 * Roteador principal da API Express.
 * Registra todos os módulos com seus prefixos.
 *
 * No servidor Express (server.ts / app.ts):
 *   import router from './src/application/api/routes';
 *   app.use('/api', router);
 */
import { Router } from 'express';
import pagamentoRoutes   from './pagamento.routes';
import tarefaRoutes      from './tarefa.routes';
import compromissoRoutes from './compromisso.routes';
import dashboardRoutes   from './dashboard.routes';
// import authRoutes     from './auth.routes';      // quando AuthController estiver pronto
// import eventoRoutes   from './evento.routes';    // quando EventoController estiver pronto
// import fornecedorRoutes from './fornecedor.routes';

const router = Router();

router.use('/pagamentos',   pagamentoRoutes);
router.use('/tarefas',      tarefaRoutes);
router.use('/compromissos', compromissoRoutes);
router.use('/dashboard',    dashboardRoutes);

export default router;
