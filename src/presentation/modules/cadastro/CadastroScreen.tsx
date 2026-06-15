import React, { useMemo } from 'react';
import { CadastroView } from '../../mvp/views/CadastroView';
import { CadastroPresenter } from '../../mvp/presenters/CadastroPresenter';
import { AuthServiceImpl, CadastroServiceImpl } from '../../../domain/services';
import { UsuarioSupabaseRepository } from '../../../persistence/repositories/UsuarioSupabaseRepository';
import { UsuarioController } from '../../../application/api/controllers/UsuarioController';
import { Usuario } from '../../../domain/models';

interface Props {
  onCadastroSuccess: (usuario: Usuario) => void;
  onVoltarLogin: () => void;
}

export function CadastroScreen({ onCadastroSuccess, onVoltarLogin }: Props) {
  const presenter = useMemo(() => {
    const repo = new UsuarioSupabaseRepository();

    const authService = new AuthServiceImpl(repo);
    const cadastroService = new CadastroServiceImpl(repo);

    const usuarioController = new UsuarioController(authService, cadastroService);

    return new CadastroPresenter(usuarioController);
  }, []);

  return (
    <CadastroView
      presenter={presenter}
      onCadastroSuccess={onCadastroSuccess}
      onVoltarLogin={onVoltarLogin}
    />
  );
}
