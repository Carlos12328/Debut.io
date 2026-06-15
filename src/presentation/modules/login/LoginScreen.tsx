import React, { useMemo } from 'react';
import { LoginView } from '../../mvp/views/LoginView';
import { LoginPresenter } from '../../mvp/presenters/LoginPresenter';
import { AuthServiceImpl, CadastroServiceImpl } from '../../../domain/services';
import { UsuarioController } from '../../../application/api/controllers/UsuarioController';
import { UsuarioSupabaseRepository } from '../../../persistence/repositories/UsuarioSupabaseRepository';
import { Usuario } from '../../../domain/models';

interface Props {
  onLoginSuccess: (usuario: Usuario) => void;
  onIrParaCadastro: () => void;
  onIrParaRecuperacao: () => void;
}

export function LoginScreen({ onLoginSuccess, onIrParaCadastro, onIrParaRecuperacao }: Props) {
  const presenter = useMemo(() => {
    const repo = new UsuarioSupabaseRepository();
    const authService = new AuthServiceImpl(repo);
    const cadastroService = new CadastroServiceImpl(repo);
    const usuarioController = new UsuarioController(authService, cadastroService);
    return new LoginPresenter(usuarioController);
  }, []);

  return (
    <LoginView
      presenter={presenter}
      onLoginSuccess={onLoginSuccess}
      onIrParaCadastro={onIrParaCadastro}
      onIrParaRecuperacao={onIrParaRecuperacao}
    />
  );
}
