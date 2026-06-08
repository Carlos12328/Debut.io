import React, { useMemo } from 'react';
import { TarefaView } from '../../mvp/views/TarefaView';
import { TarefaPresenter } from '../../mvp/presenters/TarefaPresenter';
import { TarefaServiceImpl } from '../../../domain/services';
import { TarefaController } from '../../../application/api/controllers';
import { TarefaSupabaseRepository } from '../../../persistence/repositories/TarefaSupabaseRepository';
import { Evento } from '../../../domain/models';

interface Props {
  evento: Evento;
}

export function TarefasScreen({
  evento,
}: Props) {
  const presenter = useMemo(() => {
    const repo =
      new TarefaSupabaseRepository();

    const service =
      new TarefaServiceImpl(repo);

    const controller =
      new TarefaController(
        service,
      );

    return new TarefaPresenter(
      controller,
      evento.id_evento,
    );
  }, [evento.id_evento]);

  return (
    <TarefaView
      presenter={presenter}
    />
  );
}
