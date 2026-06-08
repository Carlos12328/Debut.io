import { TarefaController } from '../controllers/TarefaController';

export const tarefaRoutes = {
  path: '/tasks',
  endpoints: {
    'GET /tasks': 'listar',
    'POST /tasks': 'cadastrar',
    'PUT /tasks/:id/status': 'atualizarStatus',
    'DELETE /tasks/:id': 'remover',
  },
  controller: TarefaController,
};
