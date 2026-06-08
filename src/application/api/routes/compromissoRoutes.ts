import { CompromissoController } from '../controllers/CompromissoController';

export const compromissoRoutes = {
  path: '/appointments',
  endpoints: {
    'GET /appointments': 'listar',
    'POST /appointments': 'cadastrar',
    'DELETE /appointments/:id': 'remover',
  },
  controller: CompromissoController,
};
