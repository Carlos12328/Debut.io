import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, Modal, ScrollView, } from 'react-native';
import { FornecedorPresenter, FornecedorView as IFornecedorView } from '../presenters/FornecedorPresenter';
import { Fornecedor } from '../../../domain/models';
import { SafeScreen } from '../../components/SafeScreen';   

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
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

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
        setCnpj(''); setTelefone(''); setEmail('');
        setCep(''); setLogradouro(''); setNumero('');
        setBairro(''); setCidade(''); setEstado('');
      },
      onFornecedorRemovido: (id) =>
        setFornecedores(prev => prev.filter(f => f.id_fornecedor !== id)),
    };
    presenter.attachView(view);
    presenter.carregarFornecedores();
    return () => presenter.detachView();
  }, [presenter]);

  const aplicarMascaraCnpj = (v: string): string => {
    const n = v.replace(/\D/g, '').slice(0, 14);
    if (n.length <= 2) return n;
    if (n.length <= 5) return `${n.slice(0,2)}.${n.slice(2)}`;
    if (n.length <= 8) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5)}`;
    if (n.length <= 12) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8)}`;
    return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}`;
  };

  const aplicarMascaraTelefone = (v: string): string => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return `(${n}`;
    if (n.length <= 6) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    if (n.length <= 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  };

  const aplicarMascaraCep = (v: string): string => {
    const n = v.replace(/\D/g, '').slice(0, 8);
    if (n.length <= 5) return n;
    return `${n.slice(0,5)}-${n.slice(5)}`;
  };

  const aplicarMascaraValor = (v: string): string => {
    const n = v.replace(/\D/g, '').slice(0, 10);
    if (!n) return '';
    const inteiro = parseInt(n, 10);
    return (inteiro / 100).toFixed(2).replace('.', ',');
  };

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
        {item.cnpj ? <Text style={styles.cardDetalhe}>CNPJ: {item.cnpj}</Text> : null}
        {item.telefone ? <Text style={styles.cardDetalhe}>Tel: {item.telefone}</Text> : null}
        {item.email ? <Text style={styles.cardDetalhe}>{item.email}</Text> : null}
        {item.endereco_cidade ? (
          <Text style={styles.cardDetalhe}>
            {item.endereco_cidade}{item.endereco_estado ? `/${item.endereco_estado}` : ''}
          </Text>
        ) : null}
        <Text style={styles.cardValor}>R$ {item.valor.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmarRemocao(item)} style={styles.btnRemover}>
        <Text style={styles.btnRemoverText}>x</Text>
      </TouchableOpacity>
    </View>
  );

  return (
  <SafeScreen backgroundColor="#f5f5f5">

      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar}>
          <Text style={styles.btnVoltar}>Voltar</Text>
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
          <ScrollView contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 }} style={{ backgroundColor: '#FFF' }}>

            <Text style={styles.modalTitulo}>Novo Fornecedor</Text>

            <Text style={styles.secao}>Dados basicos</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do fornecedor *"
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Tipo de servico (ex: Buffet) *"
              value={tipoServico}
              onChangeText={setTipoServico}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor contratado (ex: 3.000,00) *"
              value={valor}
              onChangeText={(texto) => setValor(aplicarMascaraValor(texto))}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.secao}>Contato</Text>
            <TextInput
              style={styles.input}
              placeholder="CNPJ (00.000.000/0000-00)"
              value={cnpj}
              onChangeText={(texto) => setCnpj(aplicarMascaraCnpj(texto))}
              keyboardType="numeric"
              maxLength={18}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone (61) 99999-9999"
              value={telefone}
              onChangeText={(texto) => setTelefone(aplicarMascaraTelefone(texto))}
              keyboardType="numeric"
              maxLength={15}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail do fornecedor"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.secao}>Endereco</Text>
            <TextInput
              style={styles.input}
              placeholder="CEP (00000-000)"
              value={cep}
              onChangeText={(texto) => setCep(aplicarMascaraCep(texto))}
              keyboardType="numeric"
              maxLength={9}
            />
            <TextInput
              style={styles.input}
              placeholder="Logradouro (rua, avenida...)"
              value={logradouro}
              onChangeText={setLogradouro}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputNumero]}
                placeholder="Numero"
                value={numero}
                onChangeText={setNumero}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.inputBairro]}
                placeholder="Bairro"
                value={bairro}
                onChangeText={setBairro}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputCidade]}
                placeholder="Cidade"
                value={cidade}
                onChangeText={setCidade}
              />
              <TextInput
                style={[styles.input, styles.inputEstado]}
                placeholder="UF"
                value={estado}
                onChangeText={setEstado}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={() => presenter.handleCadastrar(
                nome,
                tipoServico,
                valor.replace(',', '.'),
                cnpj.replace(/\D/g, ''),
                telefone.replace(/\D/g, ''),
                email,
                logradouro,
                numero,
                bairro,
                cidade,
                estado,
                cep.replace(/\D/g, '')
              )}
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
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 55,  flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#9b59b6' },
  btnVoltar: { color: '#fff', fontSize: 14 },
  titulo: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginHorizontal: 8 },
  btnNovo: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  btnNovoText: { color: '#9b59b6', fontWeight: 'bold' },
  subtitulo: { fontSize: 14, color: '#888', padding: 16, paddingBottom: 0 },
  secao: { fontSize: 14, fontWeight: '600', color: '#9b59b6', marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardTipo: { fontSize: 13, color: '#888', marginTop: 2 },
  cardDetalhe: { fontSize: 12, color: '#aaa', marginTop: 2 },
  cardValor: { fontSize: 15, color: '#9b59b6', fontWeight: '600', marginTop: 4 },
  btnRemover: { padding: 8 },
  btnRemoverText: { color: '#e74c3c', fontSize: 18, fontWeight: 'bold' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  vazioSub: { fontSize: 13, color: '#bbb', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  inputNumero: { flex: 1 },
  inputBairro: { flex: 2 },
  inputCidade: { flex: 2 },
  inputEstado: { flex: 1 },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 8 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
});