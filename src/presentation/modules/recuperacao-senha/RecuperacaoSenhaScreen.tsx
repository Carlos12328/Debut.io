import React, { useMemo } from 'react';
import { RecuperacaoSenhaView } from '../../mvp/views/RecuperacaoSenhaView';
import { RecuperacaoSenhaPresenter } from '../../mvp/presenters/RecuperacaoSenhaPresenter';
import { RecuperacaoSenhaServiceImpl } from '../../../domain/services';
import { UsuarioSupabaseRepository } from '../../../persistence/repositories/UsuarioSupabaseRepository';
import { AuthController } from '../../../application/api/controllers/AuthController';

interface Props {
  onVoltarLogin: () => void;
}

export function RecuperacaoSenhaScreen({
  onVoltarLogin,
}: Props) {

  const presenter = useMemo(() => {

    const usuarioRepository =
      new UsuarioSupabaseRepository();

    const service =
      new RecuperacaoSenhaServiceImpl(
        usuarioRepository
      );

    const controller =
      new AuthController(
        service
      );

    return new RecuperacaoSenhaPresenter(
      controller
    );

  }, []);

  return (
    <RecuperacaoSenhaView
      presenter={presenter}
      onVoltarLogin={onVoltarLogin}
    />
  );
}
