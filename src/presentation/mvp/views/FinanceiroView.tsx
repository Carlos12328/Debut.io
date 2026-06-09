/**
 * FinanceiroView.tsx — Debut.io
 * src/presentation/mvp/views/FinanceiroView.tsx
 *
 * Padrão idêntico ao TarefaView.tsx e EventoView.tsx existentes:
 *   • useState para dados locais
 *   • useEffect cria objeto inline que implementa a interface do Presenter
 *   • presenter.attachView(view) + presenter.detachView() no cleanup
 *   • View recebe FinanceiroViewModel pronto — sem calcular nada
 *
 * UC06 — Registrar pagamento | UC07 — Consultar pagamentos
 * UC14 — Dashboard financeiro
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal, ScrollView,
} from 'react-native';
import {
  FinanceiroPresenter,
  FinanceiroView as IFinanceiroView,
} from '../presenters/FinanceiroPresenter';
import type {
  FinanceiroViewModel,
  PagamentoFormatadoViewModel,
} from '../models/FinanceiroViewModel';

interface Props {
  presenter: FinanceiroPresenter;
  idEvento: number;
  orcamento: number;
}

// ── Estado inicial vazio ────────────────────────────────────────
const VM_INICIAL: FinanceiroViewModel = {
  resumo: {
    orcamentoTotalFormatado:  '—',
    totalGastoFormatado:      '—',
    saldoRestanteFormatado:   '—',
    percentualUtilizado:      0,
    orcamentoExcedido:        false,
    valorExcedidoFormatado:   null,
    totalAtrasadosFormatado:  '—',
    quantidadeAtrasados:      0,
  },
  pagamentos:      [],
  isCarregando:    true,
  erroMensagem:    null,
  alertaOrcamento: null,
};

export function FinanceiroView({ presenter, idEvento, orcamento }: Props) {
  const [vm, setVm]                   = useState<FinanceiroViewModel>(VM_INICIAL);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Campos do formulário de registro
  const [fornecedorId, setFornecedorId]   = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [valor, setValor]                 = useState('');
  const [vencimento, setVencimento]       = useState('');

  // ── Conexão View ↔ Presenter ──────────────────────────────────
  useEffect(() => {
    const view: IFinanceiroView = {
      showLoading:  () => setVm(prev => ({ ...prev, isCarregando: true })),
      hideLoading:  () => setVm(prev => ({ ...prev, isCarregando: false })),
      showError:    (msg) => Alert.alert('Erro', msg),

      onDadosCarregados: (dados) => setVm(dados),

      onPagamentoRegistrado: (p) => {
        setVm(prev => ({ ...prev, pagamentos: [...prev.pagamentos, p] }));
        setModalVisivel(false);
        setFornecedorId(''); setFornecedorNome('');
        setValor(''); setVencimento('');
      },

      onPagamentoAtualizado: (p) =>
        setVm(prev => ({
          ...prev,
          pagamentos: prev.pagamentos.map(x => x.id === p.id ? p : x),
        })),

      onPagamentoRemovido: (id) =>
        setVm(prev => ({
          ...prev,
          pagamentos: prev.pagamentos.filter(x => x.id !== id),
        })),

      onAlertaOrcamento: (msg) =>
        Alert.alert('⚠️ Atenção ao Orçamento', msg),
    };

    presenter.attachView(view);
    presenter.handleCarregarFinanceiro(idEvento, orcamento);
    return () => presenter.detachView();
  }, [presenter, idEvento, orcamento]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleRegistrar = () => {
    const idNum = parseInt(fornecedorId, 10);
    if (isNaN(idNum) || !fornecedorNome || !valor || !vencimento) {
      Alert.alert('Preencha todos os campos obrigatórios.');
      return;
    }
    presenter.handleRegistrarPagamento(idNum, fornecedorNome, valor, vencimento);
  };

  const confirmarExclusao = (p: PagamentoFormatadoViewModel) =>
    Alert.alert('Remover pagamento', `Remover pagamento de ${p.fornecedorNome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: () => presenter.handleRemoverPagamento(p.id),
      },
    ]);

  const aplicarMascaraData = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 8);
    if (n.length <= 2) return n;
    if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
    return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
  };

  const aplicarMascaraValor = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 9);
    if (!n) return '';
    return (parseInt(n, 10) / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // ── Loading ───────────────────────────────────────────────────
  if (vm.isCarregando) return (
    <View style={s.centralizado}>
      <ActivityIndicator size="large" color="#9b59b6" />
      <Text style={s.loadingText}>Carregando dados financeiros...</Text>
    </View>
  );

  // ── Erro ──────────────────────────────────────────────────────
  if (vm.erroMensagem) return (
    <View style={s.centralizado}>
      <Text style={s.erroText}>{vm.erroMensagem}</Text>
      <TouchableOpacity
        style={s.btnRetry}
        onPress={() => presenter.handleCarregarFinanceiro(idEvento, orcamento)}
      >
        <Text style={s.btnRetryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render principal ──────────────────────────────────────────
  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.titulo}>Financeiro</Text>
        <TouchableOpacity style={s.btnNovo} onPress={() => setModalVisivel(true)}>
          <Text style={s.btnNovoText}>+ Pagamento</Text>
        </TouchableOpacity>
      </View>

      {/* Alerta de orçamento — RN-001 */}
      {vm.alertaOrcamento && (
        <View style={s.alertaBanner}>
          <Text style={s.alertaText}>{vm.alertaOrcamento}</Text>
        </View>
      )}

      {/* Card Resumo — tudo pré-calculado pelo Presenter */}
      <View style={[s.cardResumo, vm.resumo.orcamentoExcedido && s.cardResumoExcedido]}>
        <Text style={s.resumoTitulo}>Resumo Financeiro</Text>
        <View style={s.resumoLinha}>
          <Text style={s.resumoLabel}>Orçamento</Text>
          <Text style={s.resumoValor}>{vm.resumo.orcamentoTotalFormatado}</Text>
        </View>
        <View style={s.resumoLinha}>
          <Text style={s.resumoLabel}>Total gasto</Text>
          <Text style={s.resumoValor}>{vm.resumo.totalGastoFormatado}</Text>
        </View>
        <View style={s.resumoLinha}>
          <Text style={s.resumoLabel}>Saldo</Text>
          <Text style={[s.resumoValor, { color: vm.resumo.orcamentoExcedido ? '#e74c3c' : '#2ecc71' }]}>
            {vm.resumo.orcamentoExcedido ? '-' : ''}{vm.resumo.saldoRestanteFormatado}
          </Text>
        </View>

        {/* Barra de progresso */}
        <View style={s.barraFundo}>
          <View style={[
            s.barraProgresso,
            {
              width: `${Math.min(vm.resumo.percentualUtilizado, 100)}%`,
              backgroundColor: vm.resumo.orcamentoExcedido ? '#e74c3c' : '#9b59b6',
            },
          ]} />
        </View>
        <Text style={s.barraLabel}>{vm.resumo.percentualUtilizado.toFixed(1)}% utilizado</Text>

        {vm.resumo.quantidadeAtrasados > 0 && (
          <Text style={s.atrasadoText}>
            ⚠️ {vm.resumo.quantidadeAtrasados} em atraso — {vm.resumo.totalAtrasadosFormatado}
          </Text>
        )}
      </View>

      {/* Lista de pagamentos */}
      <FlatList
        data={vm.pagamentos}
        keyExtractor={p => String(p.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        ListEmptyComponent={
          <Text style={s.vazio}>Nenhum pagamento registrado.</Text>
        }
        renderItem={({ item: p }) => (
          <View style={[s.card, { borderLeftColor: p.statusCor }]}>
            <View style={s.cardTopo}>
              <Text style={s.cardFornecedor}>{p.fornecedorNome}</Text>
              <Text style={[s.cardStatus, { color: p.statusCor }]}>{p.statusLabel}</Text>
            </View>
            <Text style={s.cardValor}>{p.valorFormatado}</Text>
            <Text style={s.cardVencimento}>{p.vencimentoLabel}</Text>

            <View style={s.cardAcoes}>
              {p.statusLabel !== 'Pago' && (
                <TouchableOpacity
                  style={s.btnPagar}
                  onPress={() => presenter.handleMarcarComoPago(p.id, p.fornecedorNome)}
                >
                  <Text style={s.btnPagarText}>Marcar como pago</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.btnRemover} onPress={() => confirmarExclusao(p)}>
                <Text style={s.btnRemoverText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal de registro de pagamento */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalContent}>
            <Text style={s.modalTitulo}>Novo Pagamento</Text>

            <TextInput
              style={s.input}
              placeholder="ID do fornecedor *"
              value={fornecedorId}
              onChangeText={setFornecedorId}
              keyboardType="numeric"
            />
            <TextInput
              style={s.input}
              placeholder="Nome do fornecedor *"
              value={fornecedorNome}
              onChangeText={setFornecedorNome}
            />
            <TextInput
              style={s.input}
              placeholder="Valor (ex: 1.500,00) *"
              value={valor}
              onChangeText={v => setValor(aplicarMascaraValor(v))}
              keyboardType="numeric"
            />
            <TextInput
              style={s.input}
              placeholder="Vencimento (DD/MM/AAAA) *"
              value={vencimento}
              onChangeText={v => setVencimento(aplicarMascaraData(v))}
              keyboardType="numeric"
              maxLength={10}
            />

            <TouchableOpacity style={s.btnSalvar} onPress={handleRegistrar}>
              <Text style={s.btnSalvarText}>Registrar Pagamento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnCancelar} onPress={() => setModalVisivel(false)}>
              <Text style={s.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f5f5f5' },
  centralizado:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText:       { marginTop: 12, color: '#666' },
  erroText:          { color: '#e74c3c', textAlign: 'center', marginBottom: 16 },
  btnRetry:          { backgroundColor: '#9b59b6', padding: 12, borderRadius: 8 },
  btnRetryText:      { color: '#fff' },

  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  titulo:            { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  btnNovo:           { backgroundColor: '#9b59b6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnNovoText:       { color: '#fff', fontWeight: '600' },

  alertaBanner:      { backgroundColor: '#fff3cd', padding: 12, margin: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  alertaText:        { color: '#856404' },

  cardResumo:        { margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardResumoExcedido:{ borderWidth: 1, borderColor: '#e74c3c' },
  resumoTitulo:      { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },
  resumoLinha:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resumoLabel:       { color: '#666' },
  resumoValor:       { fontWeight: '600', color: '#2c3e50' },
  barraFundo:        { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, marginTop: 12 },
  barraProgresso:    { height: 8, borderRadius: 4 },
  barraLabel:        { fontSize: 11, color: '#999', marginTop: 4 },
  atrasadoText:      { color: '#e74c3c', fontSize: 13, marginTop: 8 },

  card:              { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  cardTopo:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardFornecedor:    { fontWeight: '600', color: '#2c3e50', fontSize: 14 },
  cardStatus:        { fontSize: 13, fontWeight: '500' },
  cardValor:         { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 },
  cardVencimento:    { fontSize: 12, color: '#666', marginBottom: 10 },
  cardAcoes:         { flexDirection: 'row', gap: 8 },
  btnPagar:          { backgroundColor: '#2ecc71', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnPagarText:      { color: '#fff', fontSize: 12, fontWeight: '600' },
  btnRemover:        { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnRemoverText:    { color: '#fff', fontSize: 12, fontWeight: '600' },

  vazio:             { textAlign: 'center', color: '#999', marginTop: 40 },

  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:      { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitulo:       { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  input:             { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  btnSalvar:         { backgroundColor: '#9b59b6', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnSalvarText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnCancelar:       { padding: 14, alignItems: 'center' },
  btnCancelarText:   { color: '#666', fontSize: 15 },
});
