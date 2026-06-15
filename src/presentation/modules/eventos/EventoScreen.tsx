import React, { useMemo } from 'react';
import { EventoView } from '../../mvp/views/EventoView';
import { EventoPresenter } from '../../mvp/presenters/EventoPresenter';
import { EventoServiceImpl } from '../../../domain/services';
import { EventoSupabaseRepository } from '../../../persistence/repositories/EventoSupabaseRepository';
import { Usuario, Evento } from '../../../domain/models';

interface Props {
  usuario: Usuario;
  onSelecionarEvento: (evento: Evento) => void;
}

export function EventoScreen({ usuario, onSelecionarEvento }: Props) {
  const presenter = useMemo(() => {
    const repo = new EventoSupabaseRepository();
    const service = new EventoServiceImpl(repo);
    return new EventoPresenter(service, usuario.id_usuario);
  }, [usuario.id_usuario]);

  return <EventoView presenter={presenter} onSelecionarEvento={onSelecionarEvento} />;
}
