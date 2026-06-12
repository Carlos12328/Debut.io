/**
 * DashboardScreen.tsx — Debut.io
 * src/presentation/modules/dashboard/DashboardScreen.tsx
 *
 * Não exige 'usuario' — apenas 'evento' (igual ao FornecedorScreen).
 * id_usuario é derivado de evento.id_usuario quando necessário.
 */
import React, { useMemo } from 'react';
import { DashboardView }       from '../../mvp/views/DashboardView';
import { DashboardPresenter }  from '../../mvp/presenters/DashboardPresenter';
import { DashboardController } from '../../../application/api/controllers/DashboardController';
import { TarefaServiceImpl }        from '../../../domain/services/TarefaService';
import { PagamentoServiceImpl }     from '../../../domain/services/PagamentoService';
import { CompromissoServiceImpl }   from '../../../domain/services/CompromissoService';
import { FornecedorServiceImpl }    from '../../../domain/services/FornecedorService';
import { TarefaSupabaseRepository }      from '../../../persistence/repositories/TarefaSupabaseRepository';
import { PagamentoSupabaseRepository }   from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { CompromissoSupabaseRepository } from '../../../persistence/repositories/CompromissoSupabaseRepository';
import { FornecedorSupabaseRepository }  from '../../../persistence/repositories/FornecedorSupabaseRepository';
import type { Evento } from '../../../domain/models';

interface Props {
  evento: Evento;
  onIrParaFinanceiro?: () => void;
  onIrParaTarefas?:    () => void;
  onIrParaAgenda?:     () => void;
}

export function DashboardScreen({ evento, onIrParaFinanceiro, onIrParaTarefas, onIrParaAgenda }: Props) {
  const presenter = useMemo(() => {
    const ctrl = new DashboardController(
      new TarefaServiceImpl(new TarefaSupabaseRepository()),
      new PagamentoServiceImpl(new PagamentoSupabaseRepository()),
      new CompromissoServiceImpl(new CompromissoSupabaseRepository()),
      new FornecedorServiceImpl(new FornecedorSupabaseRepository()),
    );
    return new DashboardPresenter(ctrl);
  }, []);

  return (
    <DashboardView
      presenter={presenter}
      evento={evento}
      onIrParaFinanceiro={onIrParaFinanceiro}
      onIrParaTarefas={onIrParaTarefas}
      onIrParaAgenda={onIrParaAgenda}
    />
  );
}
