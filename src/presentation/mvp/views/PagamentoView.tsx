import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal, ScrollView, Platform,
} from 'react-native';
import { PagamentoPresenter, PagamentoView as IPagamentoView } from '../presenters/PagamentoPresenter';
import { Pagamento } from '../../../domain/models';
import { SafeScreen } from '../../components/SafeScreen';

interface Props {
  presenter: PagamentoPresenter;
  id_fornecedor: number;
  nomeFornecedor: string;
  onVoltar: () => void;
}

export function PagamentoView({ presenter, id_fornecedor, nomeFornecedor, onVoltar }: Props) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [erroData, setErroData] = useState('');

  const hojeObj = new Date();
  const hojeExibicao = `${String(hojeObj.getDate()).padStart(2,'0')}/${String(hojeObj.getMonth()+1).padStart(2,'0')}/${hojeObj.getFullYear()}`;
  const hojeBanco = hojeObj.toISOString().split('T')[0];

  const aplicarMascaraValor = (v: string): string => {
    const n = v.replace(/\D/g,'').slice(0,9);
    if (!n) return '';
    return (parseInt(n,10)/100).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  };

  const aplicarMascaraData = (v: string): string => {
    const n = v.replace(/\D/g,'').slice(0,8);
    if (n.length<=2) return n;
    if (n.length<=4) return `${n.slice(0,2)}/${n.slice(2)}`;
    return `${n.slice(0,2)}/${n.slice(2,4)}/${n.slice(4)}`;
  };

  const converterParaBanco = (data: string): string => {
    const [dd,mm,aaaa] = data.split('/');
    return `${aaaa}-${mm}-${dd}`;
  };

  const converterParaExibicao = (data: string): string => {
    if (!data || !data.includes('-')) return data;
    const [aaaa,mm,dd] = data.split('-');
    return `${dd}/${mm}/${aaaa}`;
  };

  const validarData = (data: string): string => {
    if (data.length < 10) return '';
    const [ddStr,mmStr,aaaaStr] = data.split('/');
    const dd = parseInt(ddStr,10);
    const mm = parseInt(mmStr,10);
    const aaaa = parseInt(aaaaStr,10);
    if (mm<1||mm>12) return 'Mes invalido.';
    const diasNoMes = new Date(aaaa,mm,0).getDate();
    if (dd<1||dd>diasNoMes) return `Dia invalido. Maximo: ${diasNoMes}.`;
    if (aaaaStr.length!==4) return 'Ano invalido.';
    if (converterParaBanco(data)<hojeBanco) return 'Vencimento nao pode ser no passado.';
    return '';
  };

  useEffect(() => {
    const view: IPagamentoView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onPagamentosCarregados: (lista) => setPagamentos(lista),
      onPagamentoRegistrado: (p) => {
        setPagamentos(prev => [...prev, p]);
        setModalVisivel(false);
        setValor(''); setVencimento(''); setErroData('');
      },
      onPagamentoPago: (p) => setPagamentos(prev => prev.map(x => x.id_pagamento===p.id_pagamento ? p : x)),
      onPagamentoRemovido: (id) => setPagamentos(prev => prev.filter(x => x.id_pagamento!==id)),
    };
    presenter.attachView(view);
    return () => presenter.detachView();
  }, [presenter]);

  const confirmarPagar = (p: Pagamento) => {
    if (p.status==='pago') { Alert.alert('Aviso','Este pagamento ja foi confirmado.'); return; }
    if (Platform.OS==='web') {
      if ((window as any).confirm(`Confirmar pagamento de R$ ${Number(p.valor).toFixed(2).replace('.',',')}?`))
        presenter.handlePagar(p.id_pagamento);
    } else {
      Alert.alert('Confirmar pagamento',`Valor: R$ ${Number(p.valor).toFixed(2).replace('.',',')}`, [
        { text:'Cancelar', style:'cancel' },
        { text:'Confirmar', onPress: () => presenter.handlePagar(p.id_pagamento) },
      ]);
    }
  };

  const confirmarRemover = (p: Pagamento) => {
    if (Platform.OS==='web') {
      if ((window as any).confirm(`Remover pagamento?`)) presenter.handleRemover(p.id_pagamento);
    } else {
      Alert.alert('Remover','Deseja remover este pagamento?',[
        { text:'Cancelar', style:'cancel' },
        { text:'Remover', style:'destructive', onPress: () => presenter.handleRemover(p.id_pagamento) },
      ]);
    }
  };

  const handleSalvar = () => {
    if (!valor) { Alert.alert('Erro','Informe o valor.'); return; }
    if (!vencimento||vencimento.length<10) { Alert.alert('Erro','Informe a data completa DD/MM/AAAA.'); return; }
    const erro = validarData(vencimento);
    if (erro) { Alert.alert('Data invalida',erro); return; }
    presenter.handleRegistrar(id_fornecedor, valor.replace(/\./g,'').replace(',','.'), converterParaBanco(vencimento));
  };

  const renderPagamento = ({ item }: { item: Pagamento }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardValor}>R$ {Number(item.valor).toFixed(2).replace('.',',')}</Text>
        <Text style={styles.cardData}>Vencimento: {converterParaExibicao(item.vencimento)}</Text>
        <View style={[styles.badge, item.status==='pago' ? styles.badgePago : styles.badgePendente]}>
          <Text style={styles.badgeText}>{item.status==='pago' ? 'Pago' : 'Pendente'}</Text>
        </View>
      </View>
      <View style={styles.cardAcoes}>
        <TouchableOpacity
          style={[styles.btnAcao, item.status==='pago' ? styles.btnDesativo : styles.btnPagar]}
          disabled={item.status==='pago'}
          onPress={() => confirmarPagar(item)}
        >
          <Text style={styles.btnAcaoTexto}>{item.status==='pago' ? 'Pago' : 'Pagar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAcao, styles.btnRemover]} onPress={() => confirmarRemover(item)}>
          <Text style={styles.btnAcaoTexto}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeScreen backgroundColor="#f5f5f5">
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Text style={styles.btnVoltar}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo} numberOfLines={1}>{nomeFornecedor}</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={() => setModalVisivel(true)}>
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Pagamentos</Text>

      {loading && <ActivityIndicator color="#9b59b6" style={{marginTop:20}}/>}

      {!loading && pagamentos.length===0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhum pagamento registrado.</Text>
          <Text style={styles.vazioSub}>Toque em "+ Novo" para adicionar.</Text>
        </View>
      )}

      <FlatList
        data={pagamentos}
        keyExtractor={(item) => item.id_pagamento.toString()}
        renderItem={renderPagamento}
        contentContainerStyle={{padding:16,gap:12}}
      />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Pagamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 1.500,00) *"
              value={valor}
              onChangeText={(t) => setValor(aplicarMascaraValor(t))}
              keyboardType="numeric"
              maxLength={14}
            />
            <Text style={styles.labelData}>Vencimento minimo: {hojeExibicao}</Text>
            <TextInput
              style={[styles.input, erroData ? styles.inputErro : null]}
              placeholder="Vencimento (DD/MM/AAAA) *"
              value={vencimento}
              onChangeText={(t) => { const f=aplicarMascaraData(t); setVencimento(f); setErroData(f.length===10?validarData(f):''); }}
              keyboardType="numeric"
              maxLength={10}
            />
            {erroData ? <Text style={styles.textoErro}>{erroData}</Text> : null}
            <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnSalvarText}>Registrar</Text>}
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
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#9b59b6'},
  btnVoltar:{color:'#fff',fontSize:14},
  titulo:{flex:1,fontSize:16,fontWeight:'bold',color:'#fff',textAlign:'center',marginHorizontal:8},
  btnNovo:{backgroundColor:'#fff',paddingHorizontal:14,paddingVertical:6,borderRadius:20},
  btnNovoText:{color:'#9b59b6',fontWeight:'bold'},
  subtitulo:{fontSize:14,color:'#888',padding:16,paddingBottom:0},
  card:{backgroundColor:'#fff',borderRadius:10,elevation:2,overflow:'hidden',marginBottom:0},
  cardInfo:{padding:16},
  cardValor:{fontSize:18,fontWeight:'bold',color:'#9b59b6'},
  cardData:{fontSize:13,color:'#888',marginTop:4},
  badge:{alignSelf:'flex-start',marginTop:8,paddingHorizontal:10,paddingVertical:3,borderRadius:12},
  badgePago:{backgroundColor:'#e8f5e9'},
  badgePendente:{backgroundColor:'#fce4ec',borderWidth:1,borderColor:'#e74c3c'},
  badgeText:{fontSize:12,fontWeight:'600',color:'#333'},
  cardAcoes:{flexDirection:'row',borderTopWidth:0.5,borderTopColor:'#eee'},
  btnAcao:{flex:1,paddingVertical:10,alignItems:'center'},
  btnPagar:{backgroundColor:'#e8f5e9'},
  btnRemover:{backgroundColor:'#fce4ec',borderLeftWidth:0.5,borderLeftColor:'#eee'},
  btnDesativo:{backgroundColor:'#f0f0f0'},
  btnAcaoTexto:{fontSize:13,fontWeight:'500',color:'#555'},
  vazio:{flex:1,justifyContent:'center',alignItems:'center',marginTop:80},
  vazioText:{fontSize:16,color:'#888'},
  vazioSub:{fontSize:13,color:'#bbb',marginTop:4},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#fff',padding:24,borderTopLeftRadius:20,borderTopRightRadius:20},
  modalTitulo:{fontSize:18,fontWeight:'bold',color:'#9b59b6',marginBottom:16},
  labelData:{fontSize:12,color:'#888',marginBottom:6,marginTop:-8},
  input:{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:12,marginBottom:16,fontSize:16},
  inputErro:{borderColor:'#e74c3c'},
  textoErro:{fontSize:12,color:'#e74c3c',marginBottom:12,marginTop:-12,fontStyle:'italic'},
  btnSalvar:{backgroundColor:'#9b59b6',padding:14,borderRadius:8,alignItems:'center',marginBottom:10,marginTop:8},
  btnSalvarText:{color:'#fff',fontSize:16,fontWeight:'bold'},
  btnCancelar:{padding:14,alignItems:'center'},
  btnCancelarText:{color:'#888',fontSize:16},
});
