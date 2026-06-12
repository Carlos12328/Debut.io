import React, { useMemo } from 'react';
import { CadastroView } from '../../mvp/views/CadastroView';
import { CadastroPresenter } from '../../mvp/presenters/CadastroPresenter';
import { AuthServiceImpl, CadastroServiceImpl } from '../../../domain/services';
import { UsuarioController } from '../../../application/api/controllers';
import { UsuarioSupabaseRepository } from '../../../persistence/repositories/UsuarioSupabaseRepository';
import { Usuario } from '../../../domain/models';

interface Props {
  onCadastroSuccess: (usuario: Usuario) => void;
  onVoltarLogin: () => void;
}

export function CadastroScreen({ onCadastroSuccess, onVoltarLogin }: Props) {
  const presenter = useMemo(() => {
    const repo = new UsuarioSupabaseRepository();
    const controller = new UsuarioController(new AuthServiceImpl(repo), new CadastroServiceImpl(repo));
    return new CadastroPresenter(controller);
  }, []);

  return (
    <CadastroView
      presenter={presenter}
      onCadastroSuccess={onCadastroSuccess}
      onVoltarLogin={onVoltarLogin}
    />
  );
}