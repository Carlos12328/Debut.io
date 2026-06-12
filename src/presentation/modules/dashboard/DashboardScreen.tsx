import React, { useMemo } from 'react';
import { DashboardView } from '../../mvp/views/DashboardView';
import { DashboardPresenter } from '../../mvp/presenters/DashboardPresenter';
import { PagamentoServiceImpl, TarefaServiceImpl } from '../../../domain/services';
import { DashboardController } from '../../../application/api/controllers';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { TarefaSupabaseRepository } from '../../../persistence/repositories/TarefaSupabaseRepository';
import { Evento } from '../../../domain/models';

interface Props { evento: Evento; onVoltar: () => void; }

export function DashboardScreen({ evento, onVoltar }: Props) {
  const presenter = useMemo(() => {
    const ctrl = new DashboardController(
      new PagamentoServiceImpl(new PagamentoSupabaseRepository()),
      new TarefaServiceImpl(new TarefaSupabaseRepository()),
    );
    return new DashboardPresenter(ctrl, evento);
  }, [evento]);

  return <DashboardView presenter={presenter} onVoltar={onVoltar} />;
}