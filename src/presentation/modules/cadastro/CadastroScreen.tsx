import React, { useMemo } from 'react';
import { CadastroView } from '../../mvp/views/CadastroView';
import { CadastroPresenter } from '../../mvp/presenters/CadastroPresenter';
import { CadastroServiceImpl } from '../../../domain/services';
import { UsuarioSQLiteRepository } from '../../../persistence/repositories/UsuarioSQLiteRepository';
import { Usuario } from '../../../domain/models';

interface Props {
  onCadastroSuccess: (usuario: Usuario) => void;
  onVoltarLogin: () => void;
}

export function CadastroScreen({ onCadastroSuccess, onVoltarLogin }: Props) {
  const presenter = useMemo(() => {
    const repo = new UsuarioSQLiteRepository();
    const service = new CadastroServiceImpl(repo);
    return new CadastroPresenter(service);
  }, []);

  return (
    <CadastroView
      presenter={presenter}
      onCadastroSuccess={onCadastroSuccess}
      onVoltarLogin={onVoltarLogin}
    />
  );
}
