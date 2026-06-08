import React, { useMemo } from 'react';
import { CompromissoView } from '../../mvp/views/CompromissoView';
import { CompromissoPresenter } from '../../mvp/presenters/CompromissoPresenter';
import { CompromissoServiceImpl } from '../../../domain/services';
import { CompromissoController } from '../../../application/api/controllers';
import { CompromissoSupabaseRepository } from '../../../persistence/repositories/CompromissoSupabaseRepository';
import { Evento } from '../../../domain/models';

interface Props {
  evento: Evento;
}

export function AgendaScreen({
  evento,
}: Props) {
  const presenter = useMemo(() => {
    const repo =
      new CompromissoSupabaseRepository();

    const service =
      new CompromissoServiceImpl(
        repo,
      );

    const controller =
      new CompromissoController(
        service,
      );

    return new CompromissoPresenter(
      controller,
      evento.id_evento,
    );
  }, [evento.id_evento]);

  return (
    <CompromissoView
      presenter={presenter}
    />
  );
}
