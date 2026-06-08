import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export function DashboardScreen() {
  const evento = {
    nome: "Erick",
    data: "2028-05-20",
    orcamento: 50000.00,
    status: "ATIVO"
  };

  const tarefasPendentes = "3 de 12";
  const totalGasto = 18500.00;
  const orcamentoRestante = evento.orcamento - totalGasto;
  
  const proximasTarefas = [
    { id: '1', nome: "Confirmar Buffet", prazo: "2026-07-15" },
    { id: '2', nome: "Pagamento do DJ", prazo: "2026-08-01" },
    { id: '3', nome: "Degustação de Doces", prazo: "2026-08-10" }
  ];

  const formatarData = (dataString: string) => {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const porcentagemGasta = Math.min((totalGasto / evento.orcamento) * 100, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel do Evento: {evento.nome}</Text>
        <View style={styles.badgeAtivo}>
          <Text style={styles.badgeText}>{evento.status}</Text>
        </View>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Data do Evento</Text>
            <Text style={styles.kpiValue}>{formatarData(evento.data)}</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Orçamento Total</Text>
            <Text style={styles.kpiValue}>{formatarMoeda(evento.orcamento)}</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Pendências</Text>
            <Text style={styles.kpiValue}>{tarefasPendentes}</Text>
          </View>
        </View>
      </View>

      <View style={styles.dashboardSectionGrid}>
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Saúde Financeira</Text>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Gasto Atual (Reservado):</Text>
            <Text style={[styles.financeValue, { color: '#E53935' }]}>{formatarMoeda(totalGasto)}</Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Disponível para Uso:</Text>
            <Text style={[styles.financeValue, { color: '#43A047' }]}>{formatarMoeda(orcamentoRestante)}</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${porcentagemGasta}%` }]} />
          </View>
          <Text style={styles.progressText}>{porcentagemGasta.toFixed(0)}% do orçamento comprometido</Text>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Próximas Tarefas Críticas</Text>
          {proximasTarefas.map((tarefa) => (
            <View key={tarefa.id} style={styles.taskItem}>
              <View style={styles.taskLeftRow}>
                <Text style={styles.taskName}>{tarefa.nome}</Text>
              </View>
              <View style={styles.taskBadgePrazo}>
                <Text style={styles.taskPrazoText}>{formatarData(tarefa.prazo)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  contentContainer: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  badgeAtivo: { backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 24 },
  kpiCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECEFF1', borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', minWidth: 240, flex: 1 },
  kpiTextGroup: { flex: 1 },
  kpiLabel: { fontSize: 12, color: '#757575', marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: '700', color: '#212121' },
  dashboardSectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  mainCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECEFF1', borderRadius: 12, padding: 20, flex: 1, minWidth: 320 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#37474F', marginBottom: 16 },
  financeRow: { flexDirection: 'row', marginBottom: 8, justifyContent: 'space-between' },
  financeLabel: { fontSize: 14, color: '#555' },
  financeValue: { fontSize: 14, fontWeight: '600' },
  progressBarBackground: { height: 8, backgroundColor: '#ECEFF1', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#7B2CBF', borderRadius: 4 },
  progressText: { fontSize: 11, color: '#78909C', marginTop: 6, textAlign: 'right' },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  taskLeftRow: { flexDirection: 'row', alignItems: 'center' },
  taskName: { fontSize: 14, color: '#212121' },
  taskBadgePrazo: { backgroundColor: '#F5F5F5', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  taskPrazoText: { fontSize: 12, color: '#616161' }
});

export default DashboardScreen;
export { DashboardScreen as DashboardView };
export { DashboardScreen as DashboardScreenComponent };