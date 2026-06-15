import React, { useMemo } from 'react';
import { EventoView } from '../../mvp/views/EventoView';
import { EventoPresenter } from '../../mvp/presenters/EventoPresenter';
import { EventoServiceImpl } from '../../../domain/services';
import { EventoController } from '../../../application/api/controllers/EventoController';
import { EventoSupabaseRepository } from '../../../persistence/repositories/EventoSupabaseRepository';
import { Usuario, Evento } from '../../../domain/models';

interface Props {
  usuario: Usuario;
  onSelecionarEvento: (evento: Evento) => void;
  onLogout: () => void;
}

export function EventoScreen({ usuario, onSelecionarEvento, onLogout }: Props) {
  const presenter = useMemo(() => {
    const repo = new EventoSupabaseRepository();
    const service = new EventoServiceImpl(repo);
    const controller = new EventoController(service);
    return new EventoPresenter(controller, usuario.id_usuario);
  }, [usuario.id_usuario]);

  return (
    <EventoView
      presenter={presenter}
      onSelecionarEvento={onSelecionarEvento}
      onLogout={onLogout}
    />
  );
}
