import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, Platform } from 'react-native';
import { FinanceiroPresenter, FinanceiroView as IFinanceiroView } from '../presenters/FinanceiroPresenter';
import { FinanceiroViewModel, FinanceiroFornecedorResumo } from '../models/FinanceiroViewModel';
import { Fornecedor } from '../../../domain/models';
import { SafeScreen } from '../../components/SafeScreen';

interface Props {
  presenter: FinanceiroPresenter;
  onSelecionarFornecedor: (fornecedor: Fornecedor) => void;
}

export function FinanceiroView({ presenter, onSelecionarFornecedor }: Props) {
  const [resumo, setResumo] = useState<FinanceiroViewModel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const view: IFinanceiroView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => { if (Platform.OS==='web') (window as any).alert(msg); else Alert.alert('Erro',msg); },
      onResumoCarregado: (dados) => setResumo(dados),
    };
    presenter.attachView(view);
    presenter.carregarResumo();
    return () => presenter.detachView();
  }, [presenter]);

  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

  const renderResumo = ({ item }: { item: FinanceiroFornecedorResumo }) => (
    <TouchableOpacity style={styles.card} onPress={()=>onSelecionarFornecedor(item.fornecedor)}>
      <View style={styles.cardTopo}>
        <Text style={styles.cardNome} numberOfLines={1}>{item.fornecedor.nome}</Text>
        <Text style={styles.cardQtd}>{item.quantidadePagamentos} pgto(s)</Text>
      </View>
      <Text style={styles.cardTipo}>{item.fornecedor.tipo_servico}</Text>
      <View style={styles.cardValores}>
        <Text style={styles.valorPago}>Pago: {fmtMoeda(item.totalPago)}</Text>
        <Text style={styles.valorPendente}>Pendente: {fmtMoeda(item.totalPendente)}</Text>
      </View>
      <Text style={styles.cardDica}>Toque para gerenciar pagamentos</Text>
    </TouchableOpacity>
  );

  return (
    <SafeScreen backgroundColor="#f5f5f5">
      <View style={styles.header}><Text style={styles.titulo}>Financeiro</Text></View>
      {loading&&<ActivityIndicator color="#9b59b6" style={{marginTop:20}}/>}
      {!loading&&resumo&&(
        <View style={styles.totaisCard}>
          <View style={styles.totaisLinha}>
            <Text style={styles.totaisLabel}>Total pago</Text>
            <Text style={styles.totaisPago}>{fmtMoeda(resumo.totalGeralPago)}</Text>
          </View>
          <View style={styles.totaisLinha}>
            <Text style={styles.totaisLabel}>Total pendente</Text>
            <Text style={styles.totaisPendente}>{fmtMoeda(resumo.totalGeralPendente)}</Text>
          </View>
        </View>
      )}
      {!loading&&resumo&&resumo.resumos.length===0&&(
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhum fornecedor cadastrado.</Text>
          <Text style={styles.vazioSub}>Cadastre fornecedores na aba Fornecedor para registrar pagamentos.</Text>
        </View>
      )}
      <FlatList data={resumo?.resumos??[]} keyExtractor={(item)=>item.fornecedor.id_fornecedor.toString()} renderItem={renderResumo} contentContainerStyle={{padding:16,gap:12}}/>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#9b59b6'},
  titulo:{fontSize:20,fontWeight:'bold',color:'#fff'},
  totaisCard:{backgroundColor:'#fff',margin:16,marginBottom:0,borderRadius:10,padding:16,elevation:2,gap:6},
  totaisLinha:{flexDirection:'row',justifyContent:'space-between'},
  totaisLabel:{fontSize:14,color:'#555'},
  totaisPago:{fontSize:14,fontWeight:'700',color:'#43A047'},
  totaisPendente:{fontSize:14,fontWeight:'700',color:'#E53935'},
  card:{backgroundColor:'#fff',borderRadius:10,padding:16,elevation:2},
  cardTopo:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  cardNome:{fontSize:16,fontWeight:'bold',color:'#333',flex:1,marginRight:8},
  cardQtd:{fontSize:11,color:'#888'},
  cardTipo:{fontSize:13,color:'#888',marginTop:2},
  cardValores:{flexDirection:'row',justifyContent:'space-between',marginTop:8},
  valorPago:{fontSize:13,fontWeight:'600',color:'#43A047'},
  valorPendente:{fontSize:13,fontWeight:'600',color:'#E53935'},
  cardDica:{fontSize:11,color:'#bda6d4',marginTop:8,fontStyle:'italic'},
  vazio:{flex:1,justifyContent:'center',alignItems:'center',padding:24,marginTop:40},
  vazioText:{fontSize:16,color:'#888',textAlign:'center'},
  vazioSub:{fontSize:13,color:'#bbb',marginTop:8,textAlign:'center',lineHeight:20},
});
