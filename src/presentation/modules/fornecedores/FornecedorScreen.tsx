import React, { useMemo, useState } from 'react';
import { FornecedorView } from '../../mvp/views/FornecedorView';
import { PagamentoView } from '../../mvp/views/PagamentoView';
import { FornecedorPresenter } from '../../mvp/presenters/FornecedorPresenter';
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
  onVoltar: () => void;
}

export function FornecedorScreen({ evento, onVoltar }: Props) {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);

  const presenter = useMemo(() => {
    const repo = new FornecedorSupabaseRepository();
    const service = new FornecedorServiceImpl(repo);
    const controller = new FornecedorController(service);
    return new FornecedorPresenter(controller, evento.id_evento);
  }, [evento.id_evento]);

  const pagamentoPresenter = useMemo(() => {
    if (!fornecedorSelecionado) return null;
    const repo = new PagamentoSupabaseRepository();
    const service = new PagamentoServiceImpl(repo);
    const controller = new PagamentoController(service);
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
    <FornecedorView
      presenter={presenter}
      nomeEvento={evento.nome}
      onVoltar={onVoltar}
      onSelecionarFornecedor={setFornecedorSelecionado}
    />
  );
}
