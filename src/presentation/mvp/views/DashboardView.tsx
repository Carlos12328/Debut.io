import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { DashboardPresenter, DashboardView as IDashboardView } from '../presenters/DashboardPresenter';
import { DashboardViewModel } from '../models/DashboardViewModel';
import { SafeScreen } from '../../components/SafeScreen';

interface Props { presenter: DashboardPresenter; onVoltar: () => void; }

export function DashboardView({ presenter, onVoltar }: Props) {
  const [dados, setDados] = useState<DashboardViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const view: IDashboardView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => { setErro(msg); if (Platform.OS!=='web') Alert.alert('Erro',msg); },
      onDashboardCarregado: (vm) => { setErro(''); setDados(vm); },
    };
    presenter.attachView(view);
    presenter.carregarDashboard();
    return () => presenter.detachView();
  }, [presenter]);

  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

  return (
    <SafeScreen backgroundColor="#FAFAFA">
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onVoltar} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Text style={styles.btnVoltar}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitulo}>Painel do Evento</Text>
        <View style={styles.espaco}/>
      </View>

      {loading&&!dados&&<ActivityIndicator color="#9b59b6" style={{marginTop:32}}/>}

      {!loading&&!dados&&!!erro&&(
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nao foi possivel carregar o painel.</Text>
          <TouchableOpacity style={styles.btnTentar} onPress={()=>presenter.carregarDashboard()}>
            <Text style={styles.btnTentarText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {dados&&(
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>{dados.nomeEvento}</Text>
            <View style={[styles.badge, dados.statusEvento==='ATIVO'?styles.badgeAtivo:styles.badgeEncerrado]}>
              <Text style={[styles.badgeText, dados.statusEvento==='ATIVO'?styles.badgeTextAtivo:styles.badgeTextEncerrado]}>
                {dados.statusEvento}
              </Text>
            </View>
          </View>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Data do Evento</Text>
              <Text style={styles.kpiValue}>{dados.dataEventoFormatada}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Orcamento Total</Text>
              <Text style={styles.kpiValue}>{fmtMoeda(dados.orcamentoTotal)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Pendencias</Text>
              <Text style={styles.kpiValue}>{dados.pendenciasLabel}</Text>
            </View>
          </View>

          <View style={styles.sectionGrid}>
            <View style={styles.mainCard}>
              <Text style={styles.cardTitle}>Saude Financeira</Text>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Gasto Atual (Reservado):</Text>
                <Text style={[styles.finValue,{color:'#E53935'}]}>{fmtMoeda(dados.totalGasto)}</Text>
              </View>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Disponivel para Uso:</Text>
                <Text style={[styles.finValue,{color:dados.disponivel>=0?'#43A047':'#E53935'}]}>{fmtMoeda(dados.disponivel)}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill,{width:`${dados.percentualComprometido}%`}]}/>
              </View>
              <Text style={styles.progressText}>{dados.percentualComprometido.toFixed(0)}% do orcamento comprometido</Text>
            </View>

            <View style={styles.mainCard}>
              <Text style={styles.cardTitle}>Proximas Tarefas Criticas</Text>
              {dados.proximasTarefas.length===0&&<Text style={styles.semTarefas}>Nenhuma tarefa pendente com prazo definido.</Text>}
              {dados.proximasTarefas.map(t=>(
                <View key={t.id} style={styles.taskItem}>
                  <Text style={styles.taskName} numberOfLines={1}>{t.nome}</Text>
                  <View style={styles.taskBadge}><Text style={styles.taskPrazo}>{t.prazoFormatado}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  headerBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,backgroundColor:'#9b59b6'},
  btnVoltar:{color:'#fff',fontSize:14},
  headerBarTitulo:{flex:1,fontSize:16,fontWeight:'bold',color:'#fff',textAlign:'center',marginHorizontal:8},
  espaco:{width:40},
  container:{flex:1,backgroundColor:'#FAFAFA'},
  content:{padding:24},
  topRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:24},
  headerTitle:{fontSize:22,fontWeight:'bold',color:'#111',flex:1,marginRight:12},
  badge:{paddingVertical:4,paddingHorizontal:12,borderRadius:20},
  badgeAtivo:{backgroundColor:'#E8F5E9'},
  badgeEncerrado:{backgroundColor:'#fce4ec'},
  badgeText:{fontWeight:'bold',fontSize:12},
  badgeTextAtivo:{color:'#2E7D32'},
  badgeTextEncerrado:{color:'#c0392b'},
  kpiGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:16,marginBottom:24},
  kpiCard:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#ECEFF1',borderRadius:12,padding:20,flex:1,minWidth:240},
  kpiLabel:{fontSize:12,color:'#757575',marginBottom:4},
  kpiValue:{fontSize:18,fontWeight:'700',color:'#212121'},
  sectionGrid:{flexDirection:'row',flexWrap:'wrap',gap:24},
  mainCard:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#ECEFF1',borderRadius:12,padding:20,flex:1,minWidth:320},
  cardTitle:{fontSize:16,fontWeight:'600',color:'#37474F',marginBottom:16},
  finRow:{flexDirection:'row',marginBottom:8,justifyContent:'space-between'},
  finLabel:{fontSize:14,color:'#555'},
  finValue:{fontSize:14,fontWeight:'600'},
  progressBg:{height:8,backgroundColor:'#ECEFF1',borderRadius:4,marginTop:12,overflow:'hidden'},
  progressFill:{height:'100%',backgroundColor:'#7B2CBF',borderRadius:4},
  progressText:{fontSize:11,color:'#78909C',marginTop:6,textAlign:'right'},
  taskItem:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#F5F5F5'},
  taskName:{fontSize:14,color:'#212121',flex:1,marginRight:8},
  taskBadge:{backgroundColor:'#F5F5F5',paddingVertical:4,paddingHorizontal:8,borderRadius:4},
  taskPrazo:{fontSize:12,color:'#616161'},
  semTarefas:{fontSize:13,color:'#999',fontStyle:'italic'},
  vazio:{flex:1,justifyContent:'center',alignItems:'center',padding:24},
  vazioText:{fontSize:15,color:'#888',textAlign:'center',marginBottom:12},
  btnTentar:{borderWidth:1,borderColor:'#9b59b6',borderRadius:8,paddingHorizontal:18,paddingVertical:10},
  btnTentarText:{color:'#9b59b6',fontWeight:'600'},
});