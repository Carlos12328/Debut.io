import React, { useMemo, useState } from 'react';
import { FinanceiroView } from '../../mvp/views/FinanceiroView';
import { FinanceiroPresenter } from '../../mvp/presenters/FinanceiroPresenter';
import { PagamentoView } from '../../mvp/views/PagamentoView';
import { PagamentoPresenter } from '../../mvp/presenters/PagamentoPresenter';
import { FornecedorServiceImpl } from '../../../domain/services';
import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { FornecedorController } from '../../../application/api/controllers/FornecedorController';
import { PagamentoController } from '../../../application/api/controllers/PagamentoController';
import { FornecedorSupabaseRepository } from '../../../persistence/repositories/FornecedorSupabaseRepository';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { Evento, Fornecedor } from '../../../domain/models';

interface Props {
  evento: Evento;
}

export function FinanceiroScreen({ evento }: Props) {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);

  const financeiroPresenter = useMemo(() => {
    const fornecedorController = new FornecedorController(
      new FornecedorServiceImpl(new FornecedorSupabaseRepository()),
    );
    const pagamentoController = new PagamentoController(
      new PagamentoServiceImpl(new PagamentoSupabaseRepository()),
    );
    return new FinanceiroPresenter(fornecedorController, pagamentoController, evento.id_evento);
  }, [evento.id_evento]);

  const pagamentoPresenter = useMemo(() => {
    if (!fornecedorSelecionado) return null;
    const controller = new PagamentoController(
      new PagamentoServiceImpl(new PagamentoSupabaseRepository()),
    );
    return new PagamentoPresenter(controller);
  }, [fornecedorSelecionado]);

  if (fornecedorSelecionado && pagamentoPresenter) {
    return (
      <PagamentoView
        presenter={pagamentoPresenter}
        id_fornecedor={fornecedorSelecionado.id_fornecedor}
        nomeFornecedor={fornecedorSelecionado.nome}
        dataEvento={evento.data_evento}
        onVoltar={() => setFornecedorSelecionado(null)}
      />
    );
  }

  return (
    <FinanceiroView
      presenter={financeiroPresenter}
      onSelecionarFornecedor={setFornecedorSelecionado}
    />
  );
}
