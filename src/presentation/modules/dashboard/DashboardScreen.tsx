import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Evento } from '../../../domain/models';

interface Props {
  evento: Evento;
}

export function DashboardScreen({ evento }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Evento</Text>
        <Text style={styles.valor}>{evento.nome}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Data</Text>
        <Text style={styles.valor}>📅 {evento.data_evento}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Orçamento total</Text>
        <Text style={styles.valor}>💰 R$ {evento.orcamento.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.valor, { color: evento.status === 'ativo' ? '#27ae60' : '#e74c3c' }]}>
          {evento.status.toUpperCase()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, textTransform: 'uppercase' },
  valor: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});
