import React, { useMemo, useState } from 'react';
import { FornecedorView } from '../../mvp/views/FornecedorView';
import { FornecedorPresenter } from '../../mvp/presenters/FornecedorPresenter';
import { PagamentoView } from '../../mvp/views/PagamentoView';
import { PagamentoPresenter } from '../../mvp/presenters/PagamentoPresenter';
import { FornecedorServiceImpl, PagamentoServiceImpl } from '../../../domain/services';
import { FornecedorController, PagamentoController } from '../../../application/api/controllers';
import { FornecedorSupabaseRepository } from '../../../persistence/repositories/FornecedorSupabaseRepository';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { Evento, Fornecedor } from '../../../domain/models';

interface Props { evento: Evento; onVoltar: () => void; }

export function FornecedorScreen({ evento, onVoltar }: Props) {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);

  const fornecedorPresenter = useMemo(() => {
    const controller = new FornecedorController(new FornecedorServiceImpl(new FornecedorSupabaseRepository()));
    return new FornecedorPresenter(controller, evento.id_evento);
  }, [evento.id_evento]);

  const pagamentoPresenter = useMemo(() => {
    if (!fornecedorSelecionado) return null;
    const controller = new PagamentoController(new PagamentoServiceImpl(new PagamentoSupabaseRepository()));
    return new PagamentoPresenter(controller, fornecedorSelecionado.id_fornecedor);
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

  return (
    <FornecedorView
      presenter={fornecedorPresenter}
      nomeEvento={evento.nome}
      onVoltar={onVoltar}
      onSelecionarFornecedor={setFornecedorSelecionado}
    />
  );
}