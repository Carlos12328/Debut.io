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

const ABAS: { id: Aba; label: string }[] = [
  { id: 'dashboard', label: 'Inicio' },
  { id: 'fornecedores', label: 'Fornecedor' },
  { id: 'financeiro', label: 'Financas' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'agenda', label: 'Agenda' },
];

export function MainScreen({ usuario, evento, onVoltarEventos }: Props) {
  const [abaAtual, setAbaAtual] = useState<Aba>('dashboard');

  const renderConteudo = () => {
    switch (abaAtual) {
      case 'dashboard': return <DashboardScreen evento={evento} />;
      case 'fornecedores': return <FornecedorScreen evento={evento} onVoltar={onVoltarEventos} />;
      case 'financeiro': return <FinanceiroScreen evento={evento} />;
      case 'tarefas': return <TarefasScreen evento={evento} />;
      case 'agenda': return <AgendaScreen evento={evento} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltarEventos}>
          <Text style={styles.btnVoltar}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo} numberOfLines={1}>{evento.nome}</Text>
        <Text style={styles.headerPerfil}>
          {usuario.perfil === 'familiar' ? 'Familiar' : 'Cerimonialista'}
        </Text>
      </View>

      <View style={styles.conteudo}>
        {renderConteudo()}
      </View>

      <View style={styles.tabBar}>
        {ABAS.map((aba) => (
          <TouchableOpacity
            key={aba.id}
            style={styles.tab}
            onPress={() => setAbaAtual(aba.id)}
          >
            <Text style={[
              styles.tabLabel,
              abaAtual === aba.id && styles.tabLabelAtivo
            ]}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#9b59b6', paddingHorizontal: 16, paddingVertical: 12 },
  btnVoltar: { color: '#fff', fontSize: 13 },
  headerTitulo: { flex: 1, fontSize: 15, fontWeight: '500', color: '#fff', textAlign: 'center', marginHorizontal: 8 },
  headerPerfil: { fontSize: 11, color: '#e8d5f5' },
  conteudo: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#ddd' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabLabel: { fontSize: 11, color: '#aaa' },
  tabLabelAtivo: { color: '#9b59b6', fontWeight: '500' },
  tabIndicador: { position: 'absolute', bottom: 0, width: 24, height: 3, backgroundColor: '#9b59b6', borderRadius: 2 },
});