import React, { useMemo, useState } from 'react';
import { FinanceiroView } from '../../mvp/views/FinanceiroView';
import { FinanceiroPresenter } from '../../mvp/presenters/FinanceiroPresenter';
import { PagamentoView } from '../../mvp/views/PagamentoView';
import { PagamentoPresenter } from '../../mvp/presenters/PagamentoPresenter';
import { FornecedorServiceImpl, PagamentoServiceImpl } from '../../../domain/services';
import { FornecedorController, PagamentoController } from '../../../application/api/controllers';
import { FornecedorSupabaseRepository } from '../../../persistence/repositories/FornecedorSupabaseRepository';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { Evento, Fornecedor } from '../../../domain/models';

interface Props { evento: Evento; }

export function FinanceiroScreen({ evento }: Props) {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);

  const financeiroPresenter = useMemo(() => {
    const fCtrl = new FornecedorController(new FornecedorServiceImpl(new FornecedorSupabaseRepository()));
    const pCtrl = new PagamentoController(new PagamentoServiceImpl(new PagamentoSupabaseRepository()));
    return new FinanceiroPresenter(fCtrl, pCtrl, evento.id_evento);
  }, [evento.id_evento]);

  const pagamentoPresenter = useMemo(() => {
    if (!fornecedorSelecionado) return null;
    const ctrl = new PagamentoController(new PagamentoServiceImpl(new PagamentoSupabaseRepository()));
    return new PagamentoPresenter(ctrl, fornecedorSelecionado.id_fornecedor);
  }, [fornecedorSelecionado]);

  if (fornecedorSelecionado && pagamentoPresenter) {
    return (
      <PagamentoView
        presenter={pagamentoPresenter}
        nomeFornecedor={fornecedorSelecionado.nome}
        onVoltar={() => setFornecedorSelecionado(null)}
      />
    );
  }

  return <FinanceiroView presenter={financeiroPresenter} onSelecionarFornecedor={setFornecedorSelecionado} />;
}
