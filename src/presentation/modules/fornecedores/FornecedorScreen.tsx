import React, { useMemo } from 'react';
import { FornecedorView } from '../../mvp/views/FornecedorView';
import { FornecedorPresenter } from '../../mvp/presenters/FornecedorPresenter';
import { FornecedorServiceImpl } from '../../../domain/services';
import { FornecedorSQLiteRepository } from '../../../persistence/repositories/FornecedorSQLiteRepository';
import { Evento } from '../../../domain/models';

interface Props {
  evento: Evento;
  onVoltar: () => void;
}

export function FornecedorScreen({ evento, onVoltar }: Props) {
  const presenter = useMemo(() => {
    const repo = new FornecedorSQLiteRepository();
    const service = new FornecedorServiceImpl(repo);
    return new FornecedorPresenter(service, evento.id_evento);
  }, [evento.id_evento]);

  return (
    <FornecedorView
      presenter={presenter}
      nomeEvento={evento.nome}
      onVoltar={onVoltar}
    />
  );
}
