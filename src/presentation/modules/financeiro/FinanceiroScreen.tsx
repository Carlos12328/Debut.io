/**
 * FinanceiroScreen.tsx — Debut.io
 * src/presentation/modules/financeiro/FinanceiroScreen.tsx
 * Padrão: mesmo de FornecedorScreen.tsx e EventoScreen.tsx
 */
import React, { useMemo } from 'react';
import { FinanceiroView }    from '../../mvp/views/FinanceiroView';
import { FinanceiroPresenter } from '../../mvp/presenters/FinanceiroPresenter';
import { PagamentoServiceImpl }  from '../../../domain/services/PagamentoService';
import { FornecedorServiceImpl } from '../../../domain/services/FornecedorService';
import { PagamentoSupabaseRepository }  from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { FornecedorSupabaseRepository } from '../../../persistence/repositories/FornecedorSupabaseRepository';
import type { Evento } from '../../../domain/models';

interface Props { evento: Evento; onVoltar?: () => void; }

export function FinanceiroScreen({ evento }: Props) {
  const presenter = useMemo(() => {
    const pagRepo  = new PagamentoSupabaseRepository();
    const forRepo  = new FornecedorSupabaseRepository();
    const pagSvc   = new PagamentoServiceImpl(pagRepo);
    const forSvc   = new FornecedorServiceImpl(forRepo);
    return new FinanceiroPresenter(pagSvc, forSvc);
  }, []);

  return (
    <FinanceiroView
      presenter={presenter}
      idEvento={evento.id_evento}
      orcamento={evento.orcamento}
    />
  );
}

