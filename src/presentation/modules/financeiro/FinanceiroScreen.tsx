import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { PagamentoView } from '../../mvp/views/PagamentoView';
import { PagamentoPresenter } from '../../mvp/presenters/PagamentoPresenter';
import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { PagamentoSupabaseRepository } from '../../../persistence/repositories/PagamentoSupabaseRepository';
import { Evento, Fornecedor } from '../../../domain/models';
import { SafeScreen } from '../../components/SafeScreen';

interface Props {
  evento: Evento;
}

export function FinanceiroScreen({ evento }: Props) {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);

  const presenter = useMemo(() => {
    if (!fornecedorSelecionado) return null;
    const repo = new PagamentoSupabaseRepository();
    const service = new PagamentoServiceImpl(repo);
    return new PagamentoPresenter(service);
  }, [fornecedorSelecionado]);

  if (fornecedorSelecionado && presenter) {
    return (
      <PagamentoView
        presenter={presenter}
        id_fornecedor={fornecedorSelecionado.id_fornecedor}
        nomeFornecedor={fornecedorSelecionado.nome}
        onVoltar={() => setFornecedorSelecionado(null)}
      />
    );
  }

  return (
    <SafeScreen backgroundColor="#f5f5f5">
      <View style={styles.header}>
        <Text style={styles.titulo}>Financeiro</Text>
      </View>
      <View style={styles.vazio}>
        <Text style={styles.vazioText}>Selecione um fornecedor</Text>
        <Text style={styles.vazioSub}>Va ate a aba Fornecedor, clique no fornecedor e registre os pagamentos por la.</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#9b59b6'},
  titulo:{fontSize:20,fontWeight:'bold',color:'#fff'},
  vazio:{flex:1,justifyContent:'center',alignItems:'center',padding:24},
  vazioText:{fontSize:16,color:'#888',textAlign:'center'},
  vazioSub:{fontSize:13,color:'#bbb',marginTop:8,textAlign:'center',lineHeight:20},
});
