import React, { useMemo } from 'react';
import { LoginView } from '../../mvp/views/LoginView';
import { LoginPresenter } from '../../mvp/presenters/LoginPresenter';
import { AuthServiceImpl } from '../../../domain/services';
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
    const service = new AuthServiceImpl(repo);
    return new LoginPresenter(service);
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
