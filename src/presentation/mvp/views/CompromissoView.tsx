import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal, ScrollView,
} from 'react-native';
import { CompromissoPresenter, CompromissoView as ICompromissoView } from '../presenters/CompromissoPresenter';
import { Compromisso } from '../../../domain/models';

interface Props {
  presenter: CompromissoPresenter;
}

export function CompromissoView({ presenter }: Props) {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    const view: ICompromissoView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onCompromissosCarregados: (lista) => setCompromissos(lista),
      onCompromissoCadastrado: (c) => {
        setCompromissos(prev => [...prev, c].sort((a, b) => a.data_compromisso.localeCompare(b.data_compromisso)));
        setModalVisivel(false);
        setDescricao(''); setData('');
      },
      onCompromissoRemovido: (id) => setCompromissos(prev => prev.filter(c => c.id_compromisso !== id)),
    };
    presenter.attachView(view);
    presenter.carregarCompromissos();
    return () => presenter.detachView();
  }, [presenter]);

  const confirmarRemocao = (c: Compromisso) => {
    Alert.alert('Remover', `Remover "${c.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => presenter.handleRemover(c.id_compromisso) },
    ]);
  };

  const renderCompromisso = ({ item }: { item: Compromisso }) => (
    <View style={styles.card}>
      <View style={styles.dataContainer}>
        <Text style={styles.dataTexto}>{item.data_compromisso.split('-').reverse().join('/')}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.descricao}>{item.descricao}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmarRemocao(item)}>
        <Text style={styles.btnRemover}>x</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Agenda</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={() => setModalVisivel(true)}>
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#9b59b6" style={{ marginTop: 20 }} />}

      {!loading && compromissos.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhum compromisso cadastrado.</Text>
        </View>
      )}

      <FlatList
        data={compromissos}
        keyExtractor={(item) => item.id_compromisso.toString()}
        renderItem={renderCompromisso}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Compromisso</Text>
            <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
            <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" value={data} onChangeText={setData} />
            <TouchableOpacity style={styles.btnSalvar} onPress={() => presenter.handleCadastrar(descricao, data)} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisivel(false)}>
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
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
  dataContainer: { backgroundColor: '#f0e6fa', borderRadius: 8, padding: 8, marginRight: 12, alignItems: 'center', minWidth: 60 },
  dataTexto: { fontSize: 12, fontWeight: 'bold', color: '#9b59b6' },
  cardInfo: { flex: 1 },
  descricao: { fontSize: 15, color: '#333' },
  btnRemover: { color: '#e74c3c', fontSize: 18, fontWeight: 'bold', paddingLeft: 8 },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
});
