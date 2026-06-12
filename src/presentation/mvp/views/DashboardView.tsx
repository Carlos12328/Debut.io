/**
 * DashboardView.tsx — Debut.io
 * src/presentation/mvp/views/DashboardView.tsx
 *
 * Padrão idêntico ao TarefaView.tsx e FinanceiroView.tsx.
 * Props usa `evento: Evento` — não mais idEvento/idUsuario separados.
 * UC14 — Dashboard financeiro | UC15 — Visão geral
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import {
  DashboardPresenter,
  DashboardView as IDashboardView,
} from '../presenters/DashboardPresenter';
import type { DashboardViewModel } from '../models/DashboardViewModel';
import type { Evento }             from '../../../domain/models';

interface Props {
  presenter:            DashboardPresenter;
  evento:               Evento;
  onIrParaFinanceiro?:  () => void;
  onIrParaTarefas?:     () => void;
  onIrParaAgenda?:      () => void;
}

const VM_INICIAL: DashboardViewModel = {
  eventoNome: '—', contagemRegressiva: '—',
  resumoFinanceiro: {
    orcamento: '—', totalGasto: '—', saldo: '—',
    percentual: 0, excedido: false, atrasados: 0, totalAtrasado: '—',
  },
  resumoTarefas: { total: 0, concluidas: 0, pendentes: 0, atrasadas: 0, percentual: 0 },
  proximosCompromissos: [], tarefasUrgentes: [],
  totalFornecedores: 0, alertas: [],
  isCarregando: true, erroMensagem: null,
};

export function DashboardView({
  presenter, evento,
  onIrParaFinanceiro, onIrParaTarefas, onIrParaAgenda,
}: Props) {
  const [vm, setVm] = useState<DashboardViewModel>(VM_INICIAL);

  // ── Conexão View ↔ Presenter ──────────────────────────────────
  useEffect(() => {
    const view: IDashboardView = {
      showLoading:          () => setVm(prev => ({ ...prev, isCarregando: true })),
      hideLoading:          () => setVm(prev => ({ ...prev, isCarregando: false })),
      showError:            (msg) => setVm(prev => ({ ...prev, erroMensagem: msg, isCarregando: false })),
      onDashboardCarregado: (dados) => setVm(dados),
    };
    presenter.attachView(view);
    presenter.handleCarregarDashboard(evento);   // ← recebe Evento completo
    return () => presenter.detachView();
  }, [presenter, evento]);

  // ── Loading ───────────────────────────────────────────────────
  if (vm.isCarregando) return (
    <View style={s.centralizado}>
      <ActivityIndicator size="large" color="#9b59b6" />
      <Text style={s.loadingText}>Carregando dashboard...</Text>
    </View>
  );

  // ── Erro ──────────────────────────────────────────────────────
  if (vm.erroMensagem) return (
    <View style={s.centralizado}>
      <Text style={s.erroText}>{vm.erroMensagem}</Text>
      <TouchableOpacity onPress={() => presenter.handleCarregarDashboard(evento)}>
        <Text style={s.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>

      {/* Header do evento */}
      <View style={s.headerEvento}>
        <Text style={s.eventoNome}>{vm.eventoNome}</Text>
        <Text style={s.contagem}>{vm.contagemRegressiva}</Text>
      </View>

      {/* Alertas */}
      {vm.alertas.map(a => (
        <View key={a.id} style={[s.alerta, { borderLeftColor: a.cor }]}>
          <Text style={[s.alertaText, { color: a.cor }]}>{a.mensagem}</Text>
        </View>
      ))}

      {/* Card Financeiro */}
      <TouchableOpacity
        style={[s.card, vm.resumoFinanceiro.excedido && s.cardAlerta]}
        onPress={onIrParaFinanceiro}
      >
        <Text style={s.cardTitulo}>Financeiro</Text>
        <View style={s.linha}>
          <Text style={s.label}>Orcamento</Text>
          <Text style={s.valor}>{vm.resumoFinanceiro.orcamento}</Text>
        </View>
        <View style={s.linha}>
          <Text style={s.label}>Gasto</Text>
          <Text style={[s.valor, vm.resumoFinanceiro.excedido && { color: '#e74c3c' }]}>
            {vm.resumoFinanceiro.totalGasto}
          </Text>
        </View>
        <View style={s.barraFundo}>
          <View style={[
            s.barraInterna,
            {
              width: `${Math.min(vm.resumoFinanceiro.percentual, 100)}%`,
              backgroundColor: vm.resumoFinanceiro.excedido ? '#e74c3c' : '#9b59b6',
            },
          ]} />
        </View>
        <Text style={s.barraLabel}>{vm.resumoFinanceiro.percentual.toFixed(1)}% utilizado</Text>
        {vm.resumoFinanceiro.atrasados > 0 && (
          <Text style={s.atrasadoText}>
            {vm.resumoFinanceiro.atrasados} pagamento(s) em atraso
          </Text>
        )}
        <Text style={s.verMais}>Ver financeiro</Text>
      </TouchableOpacity>

      {/* Card Tarefas */}
      <TouchableOpacity style={s.card} onPress={onIrParaTarefas}>
        <Text style={s.cardTitulo}>Tarefas</Text>
        <View style={s.linha}>
          <Text style={s.label}>Concluidas</Text>
          <Text style={s.valor}>
            {vm.resumoTarefas.concluidas}/{vm.resumoTarefas.total}
          </Text>
        </View>
        <View style={s.barraFundo}>
          <View style={[s.barraInterna, {
            width: `${vm.resumoTarefas.percentual}%`,
            backgroundColor: '#2ecc71',
          }]} />
        </View>
        {vm.resumoTarefas.atrasadas > 0 && (
          <Text style={s.atrasadoText}>{vm.resumoTarefas.atrasadas} atrasada(s)</Text>
        )}
        <Text style={s.verMais}>Ver tarefas</Text>
      </TouchableOpacity>

      {/* Proximos compromissos */}
      {vm.proximosCompromissos.length > 0 && (
        <TouchableOpacity style={s.card} onPress={onIrParaAgenda}>
          <Text style={s.cardTitulo}>Proximos compromissos</Text>
          {vm.proximosCompromissos.map(c => (
            <View key={c.id} style={[s.item, c.isHoje && s.itemHoje]}>
              <Text style={s.itemDesc} numberOfLines={1}>{c.descricao}</Text>
              <Text style={[s.itemLabel, { color: c.cor }]}>
                {c.diasLabel} — {c.dataFormatada}
              </Text>
            </View>
          ))}
          <Text style={s.verMais}>Ver agenda</Text>
        </TouchableOpacity>
      )}

      {/* Tarefas urgentes */}
      {vm.tarefasUrgentes.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitulo}>Tarefas urgentes</Text>
          {vm.tarefasUrgentes.map(t => (
            <View key={t.id} style={s.item}>
              <Text style={s.itemDesc} numberOfLines={1}>{t.descricao}</Text>
              <View style={s.itemRodape}>
                <Text style={[s.badge, { color: t.prioridadeCor }]}>{t.prioridade}</Text>
                <Text style={[s.itemLabel, t.isAtrasada && { color: '#e74c3c' }]}>
                  {t.prazoLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={s.rodape}>{vm.totalFornecedores} fornecedor(es) cadastrado(s)</Text>

    </ScrollView>
  );
}

// ── Estilos ────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  scroll:       { padding: 16, gap: 12 },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText:  { marginTop: 12, color: '#666' },
  erroText:     { color: '#e74c3c', textAlign: 'center', marginBottom: 16 },
  retryText:    { color: '#9b59b6', fontWeight: '600' },

  headerEvento: { backgroundColor: '#9b59b6', borderRadius: 12, padding: 20, alignItems: 'center' },
  eventoNome:   { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  contagem:     { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  alerta:       { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderLeftWidth: 4 },
  alertaText:   { fontWeight: '600' },

  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  cardAlerta:   { borderWidth: 1, borderColor: '#e74c3c' },
  cardTitulo:   { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },

  linha:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label:        { color: '#666' },
  valor:        { fontWeight: '600', color: '#2c3e50' },

  barraFundo:   { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, marginTop: 8 },
  barraInterna: { height: 8, borderRadius: 4 },
  barraLabel:   { fontSize: 11, color: '#999', marginTop: 4 },
  atrasadoText: { color: '#e74c3c', fontSize: 13, marginTop: 6 },
  verMais:      { color: '#9b59b6', fontSize: 13, marginTop: 10, textAlign: 'right' },

  item:         { padding: 10, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 8 },
  itemHoje:     { backgroundColor: '#fff3e0' },
  itemDesc:     { fontWeight: '500', color: '#2c3e50', marginBottom: 2 },
  itemRodape:   { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 },
  itemLabel:    { fontSize: 12, color: '#666' },
  badge:        { fontSize: 11, fontWeight: '700' },

  rodape:       { textAlign: 'center', color: '#bbb', fontSize: 12, paddingVertical: 8 },
});
