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

  // Modal de criar
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [erroData, setErroData] = useState('');

  // Modal de editar
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [nomeEditar, setNomeEditar] = useState('');
  const [dataEditar, setDataEditar] = useState('');
  const [orcamentoEditar, setOrcamentoEditar] = useState('');
  const [erroDataEditar, setErroDataEditar] = useState('');

  const hojeObj = new Date();
  const hojeExibicao = `${String(hojeObj.getDate()).padStart(2, '0')}/${String(hojeObj.getMonth() + 1).padStart(2, '0')}/${hojeObj.getFullYear()}`;
  const hojeBanco = hojeObj.toISOString().split('T')[0];

  const aplicarMascaraData = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  const aplicarMascaraOrcamento = (valor: string): string => {
    const n = valor.replace(/\D/g, '').slice(0, 9);
    if (!n) return '';
    const inteiro = parseInt(n, 10);
    return (inteiro / 100)
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const converterParaBanco = (data: string): string => {
    const [dd, mm, aaaa] = data.split('/');
    return `${aaaa}-${mm}-${dd}`;
  };

  const converterParaExibicao = (data: string): string => {
    if (!data || !data.includes('-')) return data;
    const [aaaa, mm, dd] = data.split('-');
    return `${dd}/${mm}/${aaaa}`;
  };

  const formatarOrcamento = (valor: number): string => {
    return Number(valor)
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const validarDataEvento = (data: string): string => {
    if (data.length < 10) return '';
    const [ddStr, mmStr, aaaaStr] = data.split('/');
    const dd = parseInt(ddStr, 10);
    const mm = parseInt(mmStr, 10);
    const aaaa = parseInt(aaaaStr, 10);
    if (mm < 1 || mm > 12) return 'Mes invalido. Use um valor entre 01 e 12.';
    const diasNoMes = new Date(aaaa, mm, 0).getDate();
    if (dd < 1 || dd > diasNoMes) return `Dia invalido. O mes informado tem no maximo ${diasNoMes} dias.`;
    if (aaaaStr.length !== 4) return 'Ano invalido.';
    const dataBanco = converterParaBanco(data);
    if (dataBanco < hojeBanco) return 'A data do evento nao pode ser uma data passada.';
    const anoMaximo = hojeObj.getFullYear() + 15;
    if (aaaa > anoMaximo) return `O ano maximo permitido e ${anoMaximo}.`;
    return '';
  };

  const handleChangeData = (texto: string, setData: Function, setErro: Function) => {
    const formatado = aplicarMascaraData(texto);
    setData(formatado);
    setErro(formatado.length === 10 ? validarDataEvento(formatado) : '');
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
        setNome(''); setDataEvento(''); setOrcamento(''); setErroData('');
      },
      onEventoAtualizado: (evento) => {
        setEventos(prev => prev.map(e => e.id_evento === evento.id_evento ? evento : e));
        setModalEditarVisivel(false);
        setEventoEditando(null);
      },
      onEventoEncerrado: (evento) => {
        setEventos(prev => prev.map(e => e.id_evento === evento.id_evento ? evento : e));
      },
    };
    presenter.attachView(view);
    presenter.carregarEventos();
    return () => presenter.detachView();
  }, [presenter]);

  const handleSalvar = () => {
    if (!nome) { Alert.alert('Erro', 'O nome do evento e obrigatorio.'); return; }
    if (!dataEvento || dataEvento.length < 10) { Alert.alert('Erro', 'Informe a data completa no formato DD/MM/AAAA.'); return; }
    const erroDataFinal = validarDataEvento(dataEvento);
    if (erroDataFinal) { Alert.alert('Data invalida', erroDataFinal); return; }
    const orcamentoLimpo = orcamento.replace(/\./g, '').replace(',', '.');
    if (!orcamento || parseFloat(orcamentoLimpo) <= 0) { Alert.alert('Erro', 'Informe um orcamento valido.'); return; }
    presenter.handleCadastrarEvento(nome, converterParaBanco(dataEvento), orcamentoLimpo);
  };

  const handleSalvarEdicao = () => {
    if (!nomeEditar) { Alert.alert('Erro', 'O nome do evento e obrigatorio.'); return; }
    if (!dataEditar || dataEditar.length < 10) { Alert.alert('Erro', 'Informe a data completa no formato DD/MM/AAAA.'); return; }
    const erroDataFinal = validarDataEvento(dataEditar);
    if (erroDataFinal) { Alert.alert('Data invalida', erroDataFinal); return; }
    const orcamentoLimpo = orcamentoEditar.replace(/\./g, '').replace(',', '.');
    if (!orcamentoEditar || parseFloat(orcamentoLimpo) <= 0) { Alert.alert('Erro', 'Informe um orcamento valido.'); return; }
    presenter.handleEditarEvento(eventoEditando!.id_evento, nomeEditar, converterParaBanco(dataEditar), orcamentoLimpo);
  };

  const abrirEditar = (evento: Evento) => {
    setEventoEditando(evento);
    setNomeEditar(evento.nome);
    setDataEditar(converterParaExibicao(evento.data_evento));
    setOrcamentoEditar(formatarOrcamento(evento.orcamento));
    setErroDataEditar('');
    setModalEditarVisivel(true);
  };

  const confirmarEncerrar = (evento: Evento) => {
  if (evento.status === 'encerrado') {
    Alert.alert('Aviso', 'Este evento ja esta encerrado.');
    return;
  }
  // Na web, Alert.alert com botoes nao funciona — usa confirm do navegador
  const confirmado = window.confirm(
    `Deseja encerrar o evento "${evento.nome}"? Esta acao nao pode ser desfeita.`
  );
  if (confirmado) {
    presenter.handleEncerrarEvento(evento.id_evento);
  }
};

  const renderEvento = ({ item }: { item: Evento }) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.cardToque} onPress={() => onSelecionarEvento(item)}>
      <Text style={styles.cardTitulo}>{item.nome}</Text>
      <Text style={styles.cardInfo}>Data: {converterParaExibicao(item.data_evento)}</Text>
      <Text style={styles.cardInfo}>
        Orcamento: R$ {formatarOrcamento(item.orcamento)}
      </Text>
      <View style={[styles.badge, item.status === 'ativo' ? styles.badgeAtivo : styles.badgeEncerrado]}>
        <Text style={[styles.badgeText, item.status === 'encerrado' && styles.badgeTextEncerrado]}>
          {item.status === 'ativo' ? 'Ativo' : 'Encerrado'}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={styles.cardAcoes}>
      <TouchableOpacity
        style={[styles.btnAcao, item.status === 'encerrado' ? styles.btnAcaoDesativo : styles.btnEditar]}
        onPress={() => item.status === 'ativo' && abrirEditar(item)}
        disabled={item.status === 'encerrado'}
      >
        <Text style={[styles.btnAcaoTexto, item.status === 'encerrado' && styles.btnTextoDesativo]}>
          Editar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnAcao, item.status === 'encerrado' ? styles.btnAcaoDesativo : styles.btnEncerrar]}
        onPress={() => item.status === 'ativo' && confirmarEncerrar(item)}
        disabled={item.status === 'encerrado'}
      >
        <Text style={[styles.btnAcaoTexto, item.status === 'encerrado' && styles.btnTextoDesativo]}>
          {item.status === 'encerrado' ? 'Encerrado' : 'Encerrar'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
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

      {/* Modal Criar */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Evento</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do evento *"
              value={nome}
              onChangeText={setNome}
              maxLength={80}
            />
            <Text style={styles.labelData}>Data minima: {hojeExibicao}</Text>
            <TextInput
              style={[styles.input, erroData ? styles.inputErro : null]}
              placeholder="Data do evento (DD/MM/AAAA) *"
              value={dataEvento}
              onChangeText={(t) => handleChangeData(t, setDataEvento, setErroData)}
              keyboardType="numeric"
              maxLength={10}
            />
            {erroData ? <Text style={styles.textoErro}>{erroData}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Orcamento (ex: 5.000,00)"
              value={orcamento}
              onChangeText={(t) => setOrcamento(aplicarMascaraOrcamento(t))}
              keyboardType="numeric"
              maxLength={12}
            />
            <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisivel(false)}>
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={modalEditarVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar Evento</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do evento *"
              value={nomeEditar}
              onChangeText={setNomeEditar}
              maxLength={80}
            />
            <Text style={styles.labelData}>Data minima: {hojeExibicao}</Text>
            <TextInput
              style={[styles.input, erroDataEditar ? styles.inputErro : null]}
              placeholder="Data do evento (DD/MM/AAAA) *"
              value={dataEditar}
              onChangeText={(t) => handleChangeData(t, setDataEditar, setErroDataEditar)}
              keyboardType="numeric"
              maxLength={10}
            />
            {erroDataEditar ? <Text style={styles.textoErro}>{erroDataEditar}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Orcamento (ex: 5.000,00)"
              value={orcamentoEditar}
              onChangeText={(t) => setOrcamentoEditar(aplicarMascaraOrcamento(t))}
              keyboardType="numeric"
              maxLength={12}
            />
            <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarEdicao} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Salvar alteracoes</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalEditarVisivel(false)}>
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
  card: { backgroundColor: '#fff', borderRadius: 10, elevation: 2, overflow: 'hidden' },
  cardToque: { padding: 16 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  cardInfo: { fontSize: 14, color: '#666', marginBottom: 2 },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeAtivo: { backgroundColor: '#e8f5e9' },
  badgeEncerrado: { backgroundColor: '#fce4ec', borderWidth: 1, borderColor: '#e74c3c' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  cardAcoes: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#eee' },
  btnAcao: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  btnEditar: { backgroundColor: '#f0e6ff', borderRightWidth: 0.5, borderRightColor: '#eee' },
  btnEncerrar: { backgroundColor: '#fce4ec' },
  btnEncerradoDesativo: { backgroundColor: '#f5f5f5' },
  btnAcaoTexto: { fontSize: 13, fontWeight: '500', color: '#555' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  vazioSub: { fontSize: 13, color: '#bbb', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 16 },
  labelData: { fontSize: 12, color: '#888', marginBottom: 6, marginTop: -8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  inputErro: { borderColor: '#e74c3c' },
  textoErro: { fontSize: 12, color: '#e74c3c', marginBottom: 12, marginTop: -12, fontStyle: 'italic' },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 8 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
  badgeTextEncerrado: { color: '#c0392b', fontWeight: '700' },
  btnAcaoDesativo: { backgroundColor: '#f0f0f0', borderRightWidth: 0.5, borderRightColor: '#eee' },
  btnTextoDesativo: { color: '#bbb' },
});