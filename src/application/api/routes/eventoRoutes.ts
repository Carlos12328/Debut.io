import { EventoController } from '../controllers/EventoController';

export const eventoRoutes = {
  path: '/events',
  endpoints: {
    'GET  /events':              'listar',
    'POST /events':              'cadastrar',
    'PUT  /events/:id':          'editar',
    'PUT  /events/:id/encerrar': 'encerrar',
  },
  controller: EventoController,
};
