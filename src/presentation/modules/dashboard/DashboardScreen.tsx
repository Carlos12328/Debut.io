import React, { useMemo } from 'react';
import { DashboardView } from '../../mvp/views/DashboardView';
import { DashboardPresenter } from '../../mvp/presenters/DashboardPresenter';
import { DashboardController } from '../../../application/api/controllers/DashboardController';
import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { TarefaServiceImpl } from '../../../domain/services/TarefaService';
import { CompromissoServiceImpl } from '../../../domain/services/CompromissoService';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { TarefaSupabaseRepository } from '../../../persistence/repositories/TarefaSupabaseRepository';
import { CompromissoSupabaseRepository } from '../../../persistence/repositories/CompromissoSupabaseRepository';
import { Evento } from '../../../domain/models';

interface Props {
  evento: Evento;
  onVoltar: () => void;
}

export function DashboardScreen({ evento, onVoltar }: Props) {
  const presenter = useMemo(() => {
    const pagamentoService = new PagamentoServiceImpl(new PagamentoSupabaseRepository());
    const tarefaService = new TarefaServiceImpl(new TarefaSupabaseRepository());
    const compromissoService = new CompromissoServiceImpl(new CompromissoSupabaseRepository());
    const controller = new DashboardController(pagamentoService, tarefaService, compromissoService);
    return new DashboardPresenter(controller, evento);
  }, [evento]);

  return <DashboardView presenter={presenter} onVoltar={onVoltar} />;
}

export default DashboardScreen;
