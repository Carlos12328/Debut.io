# Como a FinanceiroScreen usa o FinanceiroPresenter

## Padrão correto (MVP com interface View)

```typescript
// src/presentation/modules/financeiro/FinanceiroScreen.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { FinanceiroPresenter, FinanceiroView } from '../../mvp/presenters/FinanceiroPresenter';
import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { FornecedorServiceImpl } from '../../../domain/services/FornecedorService';
import { PagamentoRepositoryImpl } from '../../../persistence/repositories';
import { FornecedorRepositoryImpl } from '../../../persistence/repositories';
import type { FinanceiroViewModel, PagamentoViewModel } from '../../mvp/models';

interface Props {
  id_evento: number;
  orcamento: number;   // vem do EventoViewModel já carregado
}

export function FinanceiroScreen({ id_evento, orcamento }: Props) {
  const [vm, setVm] = React.useState<FinanceiroViewModel | null>(null);
  const presenterRef = useRef<FinanceiroPresenter | null>(null);

  useEffect(() => {
    // 1. Instanciar serviços com seus repositórios
    const pagamentoService  = new PagamentoServiceImpl(new PagamentoRepositoryImpl());
    const fornecedorService = new FornecedorServiceImpl(new FornecedorRepositoryImpl());

    // 2. Criar o Presenter
    const presenter = new FinanceiroPresenter(pagamentoService, fornecedorService);
    presenterRef.current = presenter;

    // 3. Implementar a interface View inline (objeto que satisfaz FinanceiroView)
    const view: FinanceiroView = {
      showLoading:  () => setVm(prev => prev ? {...prev, isCarregando: true} : null),
      hideLoading:  () => setVm(prev => prev ? {...prev, isCarregando: false} : null),
      showError:    (msg) => Alert.alert('Erro', msg),
      onDadosCarregados:    (dados) => setVm(dados),
      onPagamentoRegistrado: (p) => setVm(prev =>
        prev ? {...prev, pagamentos: [...prev.pagamentos, p]} : null
      ),
      onPagamentoAtualizado: (p) => setVm(prev =>
        prev ? {...prev, pagamentos: prev.pagamentos.map(x => x.id === p.id ? p : x)} : null
      ),
      onPagamentoRemovido: (id) => setVm(prev =>
        prev ? {...prev, pagamentos: prev.pagamentos.filter(x => x.id !== id)} : null
      ),
      onAlertaOrcamento: (msg) => Alert.alert('Atenção ao Orçamento', msg),
    };

    // 4. Conectar View ao Presenter e carregar dados
    presenter.attachView(view);
    presenter.handleCarregarFinanceiro(id_evento, orcamento);

    // 5. Cleanup ao desmontar
    return () => presenter.detachView();
  }, [id_evento, orcamento]);

  // ── Render — zero lógica, zero cálculo ───────────────────────
  if (!vm) return <Text>Carregando...</Text>;
  if (vm.erroMensagem) return <Text style={{ color: 'red' }}>{vm.erroMensagem}</Text>;

  return (
    <View>
      {/* Alerta de orçamento — RN-001 */}
      {vm.alertaOrcamento && <Text>{vm.alertaOrcamento}</Text>}

      {/* Resumo financeiro — tudo pré-calculado pelo Presenter */}
      <Text>Orçamento: {vm.resumo.orcamentoTotalFormatado}</Text>
      <Text>Gasto:     {vm.resumo.totalGastoFormatado}</Text>
      <Text>Saldo:     {vm.resumo.saldoRestanteFormatado}</Text>
      <Text>Utilizado: {vm.resumo.percentualUtilizado}%</Text>

      {/* Lista de pagamentos */}
      <FlatList
        data={vm.pagamentos}
        keyExtractor={p => String(p.id)}
        renderItem={({ item: p }) => (
          <View>
            {/* Tudo já formatado — View apenas renderiza */}
            <Text>{p.fornecedorNome}</Text>
            <Text>{p.valorFormatado}</Text>
            <Text style={{ color: p.statusCor }}>{p.statusLabel}</Text>
            <Text>{p.vencimentoLabel}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

## ❌ Antes (MVP antigo — bypass)
```typescript
// ERRADO — View acessando serviço diretamente
const pagamentos = await pagamentoService.listarPorFornecedor(id);
const total = pagamentos.reduce((a, p) => a + p.valor, 0); // cálculo na View!
if (total > orcamento) alert('Excedido!');                  // regra na View!
```

## ✅ Depois (MVP correto)
```typescript
// CORRETO — View só chama Presenter e renderiza ViewModel
presenter.handleCarregarFinanceiro(id_evento, orcamento);
// Presenter calcula, formata, verifica RN-001, chama onDadosCarregados(vm)
// View recebe vm e renderiza: {vm.resumo.totalGastoFormatado}
```
