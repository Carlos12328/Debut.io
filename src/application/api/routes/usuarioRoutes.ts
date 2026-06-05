import { UsuarioController } from '../controllers/UsuarioController';

export const usuarioRoutes = {
  path: '/users',
  endpoints: {
    'POST /users/login':    'login',
    'POST /users/cadastro': 'cadastrar',
  },
  controller: UsuarioController,
};
