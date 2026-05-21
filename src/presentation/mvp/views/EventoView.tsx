import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal, ScrollView,
} from 'react-native';
import { EventoPresenter, EventoView as IEventoView } from '../presenters/EventoPresenter';
import { Evento } from '../../../domain/models';

interface Props {
  presenter: EventoPresenter;
  onSelecionarEvento: (evento: Evento) => void;
}

export function EventoView({ presenter, onSelecionarEvento }: Props) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [orcamento, setOrcamento] = useState('');

  const hoje = new Date().toISOString().split('T')[0];

  const aplicarMascaraData = (valor: string): string => {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0,2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0,2)}/${numeros.slice(2,4)}/${numeros.slice(4)}`;
};

  useEffect(() => {
    const view: IEventoView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onEventosCargados: (lista) => setEventos(lista),
      onEventoCadastrado: (evento) => {
        setEventos(prev => [...prev, evento]);
        setModalVisivel(false);
        setNome(''); setDataEvento(''); setOrcamento('');
      },
    };
    presenter.attachView(view);
    presenter.carregarEventos();
    return () => presenter.detachView();
  }, [presenter]);

    const handleSalvar = () => {
  if (!nome) {
    Alert.alert('Erro', 'O nome do evento e obrigatorio.');
    return;
  }
  if (!dataEvento || dataEvento.length < 10) {
    Alert.alert('Erro', 'Informe a data completa no formato DD/MM/AAAA.');
    return;
  }
  const [dd, mm, aaaa] = dataEvento.split('/');
  const dataBanco = `${aaaa}-${mm}-${dd}`;

  if (dataBanco < hoje) {
    Alert.alert('Erro', 'A data do evento nao pode ser uma data passada.');
    return;
  }

  presenter.handleCadastrarEvento(nome, dataBanco, orcamento);
};

  const renderEvento = ({ item }: { item: Evento }) => (
    <TouchableOpacity style={styles.card} onPress={() => onSelecionarEvento(item)}>
      <Text style={styles.cardTitulo}>{item.nome}</Text>
      <Text style={styles.cardInfo}>Data: {item.data_evento}</Text>
      <Text style={styles.cardInfo}>Orcamento: R$ {item.orcamento.toFixed(2)}</Text>
      <View style={[styles.badge, item.status === 'ativo' ? styles.badgeAtivo : styles.badgeEncerrado]}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Meus Eventos</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={() => setModalVisivel(true)}>
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#9b59b6" style={{ marginTop: 20 }} />}

      {!loading && eventos.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhum evento cadastrado.</Text>
          <Text style={styles.vazioSub}>Toque em "+ Novo" para comecar.</Text>
        </View>
      )}

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id_evento.toString()}
        renderItem={renderEvento}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Evento</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do evento *"
              value={nome}
              onChangeText={setNome}
            />
            <Text style={styles.labelData}>Data minima: {hoje}</Text>
            <TextInput
            style={styles.input}
            placeholder="Data do evento (DD/MM/AAAA) *"
            value={dataEvento}
            onChangeText={(texto) => setDataEvento(aplicarMascaraData(texto))}
            keyboardType="numeric"
            maxLength={10}
            />
            <TextInput
              style={styles.input}
              placeholder="Orcamento (ex: 5000.00)"
              value={orcamento}
              onChangeText={setOrcamento}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnSalvarText}>Salvar</Text>
              }
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
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  btnNovo: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  btnNovoText: { color: '#9b59b6', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, elevation: 2 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  cardInfo: { fontSize: 14, color: '#666', marginBottom: 2 },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeAtivo: { backgroundColor: '#e8f5e9' },
  badgeEncerrado: { backgroundColor: '#fce4ec' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  vazioSub: { fontSize: 13, color: '#bbb', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 16 },
  labelData: { fontSize: 12, color: '#888', marginBottom: 6, marginTop: -8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 8 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
});
