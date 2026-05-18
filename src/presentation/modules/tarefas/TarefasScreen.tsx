import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Evento } from '../../../domain/models';

interface Props { evento: Evento; }

export function TarefasScreen({ evento }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>✅ Módulo de Tarefas</Text>
      <Text style={styles.sub}>Em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  texto: { fontSize: 20, fontWeight: 'bold', color: '#9b59b6' },
  sub: { fontSize: 14, color: '#888', marginTop: 8 },
});
