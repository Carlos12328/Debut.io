import { PagamentoController } from '../controllers/PagamentoController';

export const pagamentoRoutes = {
  path: '/payments',
  endpoints: {
    'GET    /payments':             'listar',
    'POST   /payments':             'registrar',
    'PUT    /payments/:id/pagar':   'pagar',
    'DELETE /payments/:id':         'remover',
  },
  controller: PagamentoController,
};
