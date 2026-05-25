import React, { useMemo } from 'react';
import { RecuperacaoSenhaView } from '../../mvp/views/RecuperacaoSenhaView';
import { RecuperacaoSenhaPresenter } from '../../mvp/presenters/RecuperacaoSenhaPresenter';
import { RecuperacaoSenhaServiceImpl } from '../../../domain/services';
import { UsuarioSupabaseRepository } from '../../../persistence/repositories/UsuarioSupabaseRepository';

interface Props {
  onVoltarLogin: () => void;
}

export function RecuperacaoSenhaScreen({ onVoltarLogin }: Props) {
  const presenter = useMemo(() => {
    const repo = new UsuarioSupabaseRepository();
    const service = new RecuperacaoSenhaServiceImpl(repo);
    return new RecuperacaoSenhaPresenter(service);
  }, []);

  return <RecuperacaoSenhaView presenter={presenter} onVoltarLogin={onVoltarLogin} />;
}
