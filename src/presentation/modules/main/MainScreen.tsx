import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Evento, Usuario } from '../../../domain/models';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { FornecedorScreen } from '../fornecedores/FornecedorScreen';
import { FinanceiroScreen } from '../financeiro/FinanceiroScreen';
import { TarefasScreen } from '../tarefas/TarefasScreen';
import { AgendaScreen } from '../agenda/AgendaScreen';

type Aba = 'dashboard' | 'fornecedores' | 'financeiro' | 'tarefas' | 'agenda';

interface Props {
  usuario: Usuario;
  evento: Evento;
  onVoltarEventos: () => void;
}

const ABAS: { id: Aba; label: string; icone: string }[] = [
  { id: 'dashboard', label: 'Início', icone: '🏠' },
  { id: 'fornecedores', label: 'Fornecedor', icone: '🤝' },
  { id: 'financeiro', label: 'Finanças', icone: '💰' },
  { id: 'tarefas', label: 'Tarefas', icone: '✅' },
  { id: 'agenda', label: 'Agenda', icone: '📅' },
];

export function MainScreen({ usuario, evento, onVoltarEventos }: Props) {
  const [abaAtual, setAbaAtual] = useState<Aba>('dashboard');

  const renderConteudo = () => {
    switch (abaAtual) {
      case 'dashboard':    return <DashboardScreen evento={evento} />;
      case 'fornecedores': return <FornecedorScreen evento={evento} onVoltar={onVoltarEventos} />;
      case 'financeiro':   return <FinanceiroScreen evento={evento} />;
      case 'tarefas':      return <TarefasScreen evento={evento} />;
      case 'agenda':       return <AgendaScreen evento={evento} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltarEventos}>
          <Text style={styles.btnVoltar}>← Eventos</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo} numberOfLines={1}>{evento.nome}</Text>
        <Text style={styles.headerPerfil}>{usuario.perfil === 'familiar' ? '👨‍👩‍👧' : '🎪'}</Text>
      </View>

      {/* Conteúdo da aba */}
      <View style={styles.conteudo}>
        {renderConteudo()}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {ABAS.map((aba) => (
          <TouchableOpacity
            key={aba.id}
            style={styles.tabItem}
            onPress={() => setAbaAtual(aba.id)}
          >
            <Text style={styles.tabIcone}>{aba.icone}</Text>
            <Text style={[styles.tabLabel, abaAtual === aba.id && styles.tabLabelAtivo]}>
              {aba.label}
            </Text>
            {abaAtual === aba.id && <View style={styles.tabIndicador} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9b59b6',
    padding: 16,
    paddingTop: 48,
  },
  btnVoltar: { color: '#fff', fontSize: 14 },
  headerTitulo: { flex: 1, color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginHorizontal: 8 },
  headerPerfil: { fontSize: 20 },
  conteudo: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
    elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, position: 'relative' },
  tabIcone: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: '#aaa', marginTop: 2 },
  tabLabelAtivo: { color: '#9b59b6', fontWeight: 'bold' },
  tabIndicador: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    backgroundColor: '#9b59b6',
    borderRadius: 2,
  },
});
