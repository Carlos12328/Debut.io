import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, FlatList, Modal, ScrollView,
} from 'react-native';
import { TarefaPresenter, TarefaView as ITarefaView } from '../presenters/TarefaPresenter';
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../../../domain/models';

interface Props {
  presenter: TarefaPresenter;
}

const PRIORIDADE_COR: Record<PrioridadeTarefa, string> = {
  alta: '#e74c3c',
  media: '#f39c12',
  baixa: '#27ae60',
};

const STATUS_LABEL: Record<StatusTarefa, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
};

const PROXIMOS_STATUS: Record<StatusTarefa, StatusTarefa[]> = {
  pendente: ['em_andamento', 'concluida'],
  em_andamento: ['pendente', 'concluida'],
  concluida: ['pendente', 'em_andamento'],
};

export function TarefaView({ presenter }: Props) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState<Tarefa | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusTarefa | 'todos'>('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<PrioridadeTarefa | 'todos'>('todos');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('media');
  const [prazo, setPrazo] = useState('');
  const [responsavel, setResponsavel] = useState('');

  useEffect(() => {
    const view: ITarefaView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onTarefasCarregadas: (lista) => setTarefas(lista),
      onTarefaCadastrada: (t) => {
        setTarefas(prev => [...prev, t]);
        setModalCadastro(false);
        setDescricao(''); setPrazo(''); setResponsavel(''); setPrioridade('media');
      },
      onTarefaAtualizada: (t) => {
        setTarefas(prev => prev.map(x => x.id_tarefa === t.id_tarefa ? t : x));
        setModalDetalhe(t);
      },
      onTarefaRemovida: (id) => {
        setTarefas(prev => prev.filter(t => t.id_tarefa !== id));
        setModalDetalhe(null);
      },
    };
    presenter.attachView(view);
    presenter.carregarTarefas();
    return () => presenter.detachView();
  }, [presenter]);

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtroStatus !== 'todos' && t.status !== filtroStatus) return false;
    if (filtroPrioridade !== 'todos' && t.prioridade !== filtroPrioridade) return false;
    return true;
  });

  const confirmarRemocao = (t: Tarefa) => {
    Alert.alert('Remover', `Remover "${t.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => presenter.handleRemover(t.id_tarefa) },
    ]);
  };

  const renderTarefa = ({ item }: { item: Tarefa }) => (
    <TouchableOpacity style={styles.card} onPress={() => setModalDetalhe(item)}>
      <View style={[styles.prioridadeBarra, { backgroundColor: PRIORIDADE_COR[item.prioridade ?? 'media'] }]} />
      <View style={styles.cardConteudo}>
        <Text style={[styles.descricao, item.status === 'concluida' && styles.descricaoConcluida]}>
          {item.descricao}
        </Text>
        <View style={styles.cardRodape}>
          {item.prazo && <Text style={styles.infoTexto}>📅 {item.prazo.split('-').reverse().join('/')}</Text>}
          {item.responsavel && <Text style={styles.infoTexto}>👤 {item.responsavel}</Text>}
          <View style={[styles.statusBadge, {
            backgroundColor: item.status === 'concluida' ? '#e8f5e9' : item.status === 'em_andamento' ? '#fff3e0' : '#f5f5f5'
          }]}>
            <Text style={styles.statusTexto}>{STATUS_LABEL[item.status]}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Tarefas</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={() => setModalCadastro(true)}>
          <Text style={styles.btnNovoText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosContainer}>
        {(['todos', 'pendente', 'em_andamento', 'concluida'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filtroBtn, filtroStatus === s && styles.filtroBtnAtivo]}
            onPress={() => setFiltroStatus(s)}
          >
            <Text style={[styles.filtroTexto, filtroStatus === s && styles.filtroTextoAtivo]}>
              {s === 'todos' ? 'Todos' : STATUS_LABEL[s as StatusTarefa]}
            </Text>
          </TouchableOpacity>
        ))}
        {(['alta', 'media', 'baixa'] as PrioridadeTarefa[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.filtroBtn, filtroPrioridade === p && { backgroundColor: PRIORIDADE_COR[p], borderColor: PRIORIDADE_COR[p] }]}
            onPress={() => setFiltroPrioridade(prev => prev === p ? 'todos' : p)}
          >
            <Text style={[styles.filtroTexto, filtroPrioridade === p && { color: '#fff' }]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator color="#9b59b6" style={{ marginTop: 20 }} />}

      {!loading && tarefasFiltradas.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Nenhuma tarefa encontrada.</Text>
        </View>
      )}

      <FlatList
        data={tarefasFiltradas}
        keyExtractor={(item) => item.id_tarefa.toString()}
        renderItem={renderTarefa}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      />

      {/* Modal cadastro */}
      <Modal visible={modalCadastro} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>Nova Tarefa</Text>
            <TextInput style={styles.input} placeholder="Descrição da tarefa *" value={descricao} onChangeText={setDescricao} multiline />
            <TextInput style={styles.input} placeholder="Responsável" value={responsavel} onChangeText={setResponsavel} />
            <TextInput style={styles.input} placeholder="Prazo (AAAA-MM-DD)" value={prazo} onChangeText={setPrazo} />
            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.prioridadeContainer}>
              {(['alta', 'media', 'baixa'] as PrioridadeTarefa[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.prioridadeBtn, prioridade === p && { backgroundColor: PRIORIDADE_COR[p], borderColor: PRIORIDADE_COR[p] }]}
                  onPress={() => setPrioridade(p)}
                >
                  <Text style={[styles.prioridadeBtnText, prioridade === p && { color: '#fff' }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btnSalvar} onPress={() => presenter.handleCadastrar(descricao, prioridade, prazo, responsavel)} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalCadastro(false)}>
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal detalhe */}
      {modalDetalhe && (
        <Modal visible={!!modalDetalhe} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitulo}>Detalhes da Tarefa</Text>
              <Text style={styles.detalheLabel}>Descrição</Text>
              <Text style={styles.detalheValor}>{modalDetalhe.descricao}</Text>
              {modalDetalhe.responsavel && <>
                <Text style={styles.detalheLabel}>Responsável</Text>
                <Text style={styles.detalheValor}>{modalDetalhe.responsavel}</Text>
              </>}
              {modalDetalhe.prazo && <>
                <Text style={styles.detalheLabel}>Prazo</Text>
                <Text style={styles.detalheValor}>{modalDetalhe.prazo.split('-').reverse().join('/')}</Text>
              </>}
              <Text style={styles.detalheLabel}>Prioridade</Text>
              <Text style={[styles.detalheValor, { color: PRIORIDADE_COR[modalDetalhe.prioridade ?? 'media'] }]}>
                {(modalDetalhe.prioridade ?? 'media').charAt(0).toUpperCase() + (modalDetalhe.prioridade ?? 'media').slice(1)}
              </Text>
              <Text style={styles.detalheLabel}>Alterar Status</Text>
              <View style={styles.statusContainer}>
                {PROXIMOS_STATUS[modalDetalhe.status].map(s => (
                  <TouchableOpacity key={s} style={styles.statusBtn} onPress={() => presenter.handleAtualizarStatus(modalDetalhe.id_tarefa, s)}>
                    <Text style={styles.statusBtnText}>→ {STATUS_LABEL[s]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.btnRemoverDetalhe} onPress={() => confirmarRemocao(modalDetalhe)}>
                <Text style={styles.btnRemoverDetalheText}>Remover Tarefa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalDetalhe(null)}>
                <Text style={styles.btnCancelarText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#9b59b6' },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  btnNovo: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  btnNovoText: { color: '#9b59b6', fontWeight: 'bold' },
  filtrosContainer: { paddingHorizontal: 16, paddingVertical: 10, maxHeight: 52 },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  filtroBtnAtivo: { backgroundColor: '#9b59b6', borderColor: '#9b59b6' },
  filtroTexto: { fontSize: 12, color: '#666' },
  filtroTextoAtivo: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 10, elevation: 2, flexDirection: 'row', overflow: 'hidden' },
  prioridadeBarra: { width: 4 },
  cardConteudo: { flex: 1, padding: 14 },
  descricao: { fontSize: 15, color: '#333', marginBottom: 6 },
  descricaoConcluida: { textDecorationLine: 'line-through', color: '#aaa' },
  cardRodape: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  infoTexto: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusTexto: { fontSize: 11, color: '#555' },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  vazioText: { fontSize: 16, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#9b59b6', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  label: { fontSize: 13, color: '#555', marginBottom: 8 },
  prioridadeContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  prioridadeBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  prioridadeBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },
  statusContainer: { gap: 8, marginBottom: 16 },
  statusBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#9b59b6', alignItems: 'center' },
  statusBtnText: { color: '#9b59b6', fontWeight: '600' },
  detalheLabel: { fontSize: 12, color: '#888', marginTop: 12, marginBottom: 2, textTransform: 'uppercase' },
  detalheValor: { fontSize: 16, color: '#333', fontWeight: '500' },
  btnSalvar: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#888', fontSize: 16 },
  btnRemoverDetalhe: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e74c3c', alignItems: 'center', marginBottom: 10 },
  btnRemoverDetalheText: { color: '#e74c3c', fontWeight: 'bold' },
});
