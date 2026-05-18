import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal, ScrollView,
} from 'react-native';
import { FornecedorPresenter, FornecedorView as IFornecedorView } from '../presenters/FornecedorPresenter';
import { Fornecedor } from '../../../domain/models';

interface Props {
  presenter: FornecedorPresenter;
  nomeEvento: string;
  onVoltar: () => void;
}

export function FornecedorView({ presenter, nomeEvento, onVoltar }: Props) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [valor, setValor] = useState('');

  useEffect(() => {
    const view: IFornecedorView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onFornecedoresCarregados: (lista) => setFornecedores(lista),
      onFornecedorCadastrado: (f) => {
        setFornecedores(prev => [...prev, f]);
        setModalVisivel(false);
        setNome(''); setTipoServico(''); setValor('');
      },
      onFornecedorRemovido: (id) => setFornecedores(prev => prev.filter(f => f.id_fornecedor !== id)),
    };
    presenter.attachView(view);
    presenter.carregarFornecedores();
    return () => presenter.detachView();
  }, [presenter]);

  const confirmarRemocao = (f: Fornecedor) => {
    Alert.alert('Remover', `Remover "${f.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => presenter.handleRemover(f.id_fornecedor) },
    ]);
  };

  const renderFornecedor = ({ item }: { item: Fornecedor }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNome}>{item.nome}</Text>
        <Text style={styles.cardTipo}>{item.tipo_servico}</Text>
        <Text style={styles.cardValor}>R$ {item.valor.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmarRemocao(item)} style={styles.btnRemover}>
        <Text style={styles.btnRemoverText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar}>
          <Text style={styles.btnVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo} numberOfLines={1}>{nomeEvento}</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={() => setModalVisivel(true)}>
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Fornecedores</Text>

      {loading && <ActivityIndicator color="#9b59b6" style={{ marginTop: 20 }} />}

      {!loading && fornecedores.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhum fornecedor cadastrado.</Text>
          <Text style={styles.vazioSub}>Toque em "+ Novo" para adicionar.</Text>
        </View>
      )}

      <FlatList
        data={fornecedores}
        keyExtractor={(item) => item.id_fornecedor.toString()}
        renderItem={renderFornecedor}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Fornecedor</Text>
            <TextInput style={styles.input} placeholder="Nome do fornecedor" value={nome} onChangeText={setNome} />
            <TextInput style={styles.input} placeholder="Tipo de serviço (ex: Buffet)" value={tipoServico} onChangeText={setTipoServico} />
            <TextInput style={styles.input} placeholder="Valor contratado (ex: 3000.00)" value={valor} onChangeText={setValor} keyboardType="numeric" />
            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={() => presenter.handleCadastrar(nome, tipoServico, valor)}
              disabled={loading}
            >
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
  btnVoltar: { color: '#fff', fontSize: 14 },
  titulo: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginHorizontal: 8 },
  btnNovo: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  btnNovoText: { color: '#9b59b6', fontWeight: 'bold' },
  subtitulo: { fontSize: 14, color: '#888', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardTipo: { fontSize: 13, color: '#888', marginTop: 2 },
  cardValor: { fontSize: 15, color: '#9b59b6', fontWeight: '600', marginTop: 4 },
  btnRemover: { padding: 8 },
  btnRemoverText: { color: '#e74c3c', fontSize: 18, fontWeight: 'bold' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  vazioSub: { fontSize: 13, color: '#bbb', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
});
