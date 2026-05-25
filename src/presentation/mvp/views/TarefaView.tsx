import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal,
} from 'react-native';
import { TarefaPresenter, TarefaView as ITarefaView } from '../presenters/TarefaPresenter';
import { Tarefa } from '../../../domain/models';

interface Props {
  presenter: TarefaPresenter;
}

export function TarefaView({ presenter }: Props) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    const view: ITarefaView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onTarefasCarregadas: (lista) => setTarefas(lista),
      onTarefaCadastrada: (t) => {
        setTarefas(prev => [...prev, t]);
        setModalVisivel(false);
        setDescricao('');
      },
      onTarefaConcluida: (t) => setTarefas(prev => prev.map(x => x.id_tarefa === t.id_tarefa ? t : x)),
      onTarefaRemovida: (id) => setTarefas(prev => prev.filter(t => t.id_tarefa !== id)),
    };
    presenter.attachView(view);
    presenter.carregarTarefas();
    return () => presenter.detachView();
  }, [presenter]);

  const confirmarRemocao = (t: Tarefa) => {
    Alert.alert('Remover', `Remover "${t.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => presenter.handleRemover(t.id_tarefa) },
    ]);
  };

  const pendentes = tarefas.filter(t => t.status === 'pendente');
  const concluidas = tarefas.filter(t => t.status === 'concluida');

  const renderTarefa = ({ item }: { item: Tarefa }) => (
    <View style={[styles.card, item.status === 'concluida' && styles.cardConcluido]}>
      <TouchableOpacity style={styles.checkbox} onPress={() => item.status === 'pendente' && presenter.handleConcluir(item.id_tarefa)}>
        <Text style={styles.checkboxText}>{item.status === 'concluida' ? '✅' : '⬜'}</Text>
      </TouchableOpacity>
      <Text style={[styles.descricao, item.status === 'concluida' && styles.descricaoConcluida]}>{item.descricao}</Text>
      <TouchableOpacity onPress={() => confirmarRemocao(item)}>
        <Text style={styles.btnRemover}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Tarefas</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={() => setModalVisivel(true)}>
          <Text style={styles.btnNovoText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#9b59b6" style={{ marginTop: 20 }} />}

      {!loading && tarefas.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhuma tarefa cadastrada.</Text>
        </View>
      )}

      <FlatList
        data={[...pendentes, ...concluidas]}
        keyExtractor={(item) => item.id_tarefa.toString()}
        renderItem={renderTarefa}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Nova Tarefa</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição da tarefa"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />
            <TouchableOpacity style={styles.btnSalvar} onPress={() => presenter.handleCadastrar(descricao)} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisivel(false)}>
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#9b59b6' },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  btnNovo: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  btnNovoText: { color: '#9b59b6', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardConcluido: { opacity: 0.6 },
  checkbox: { marginRight: 10 },
  checkboxText: { fontSize: 20 },
  descricao: { flex: 1, fontSize: 15, color: '#333' },
  descricaoConcluida: { textDecorationLine: 'line-through', color: '#aaa' },
  btnRemover: { color: '#e74c3c', fontSize: 18, fontWeight: 'bold', paddingLeft: 8 },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, minHeight: 80 },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
});
