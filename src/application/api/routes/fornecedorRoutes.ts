import { FornecedorController } from '../controllers/FornecedorController';

export const fornecedorRoutes = {
  path: '/suppliers',
  endpoints: {
    'GET    /suppliers':      'listar',
    'POST   /suppliers':      'cadastrar',
    'DELETE /suppliers/:id':  'remover',
  },
  controller: FornecedorController,
};
