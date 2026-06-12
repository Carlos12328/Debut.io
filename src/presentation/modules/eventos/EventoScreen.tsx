import React, { useMemo } from 'react';
import { EventoView } from '../../mvp/views/EventoView';
import { EventoPresenter } from '../../mvp/presenters/EventoPresenter';
import { EventoServiceImpl } from '../../../domain/services';
import { EventoController } from '../../../application/api/controllers';
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
    const controller = new EventoController(new EventoServiceImpl(repo));
    return new EventoPresenter(controller, usuario.id_usuario);
  }, [usuario.id_usuario]);

  return <EventoView presenter={presenter} onSelecionarEvento={onSelecionarEvento} onLogout={onLogout} />;
}