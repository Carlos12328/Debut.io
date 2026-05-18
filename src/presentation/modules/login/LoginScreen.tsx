import React, { useMemo } from 'react';
import { LoginView } from '../../mvp/views/LoginView';
import { LoginPresenter } from '../../mvp/presenters/LoginPresenter';
import { AuthServiceImpl } from '../../../domain/services';
import { UsuarioSQLiteRepository } from '../../../persistence/repositories/UsuarioSQLiteRepository';
import { Usuario } from '../../../domain/models';

interface Props {
  onLoginSuccess: (usuario: Usuario) => void;
  onIrParaCadastro: () => void;
}

export function LoginScreen({ onLoginSuccess, onIrParaCadastro }: Props) {
  const presenter = useMemo(() => {
    const repo = new UsuarioSQLiteRepository();
    const service = new AuthServiceImpl(repo);
    return new LoginPresenter(service);
  }, []);

  return <LoginView presenter={presenter} onLoginSuccess={onLoginSuccess} onIrParaCadastro={onIrParaCadastro} />;
}
