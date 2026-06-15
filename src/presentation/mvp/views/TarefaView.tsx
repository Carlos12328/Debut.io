import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  TarefaPresenter,
  TarefaView as ITarefaView,
} from '../presenters/TarefaPresenter';
import {
  CategoriaTarefa,
  PrioridadeTarefa,
  StatusTarefa,
} from '../../../domain/models';
import { TarefaViewModel } from '../models/TarefaViewModel';

interface Props {
  presenter: TarefaPresenter;
}

type Filtro<T> = T | 'todos';

type ModoFormulario = 'cadastro' | 'edicao';

type TipoFeedback = 'sucesso' | 'erro' | 'confirmacao';

interface FeedbackState {
  visivel: boolean;
  tipo: TipoFeedback;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  onConfirm?: () => void;
}

const PRIORIDADES: {
  valor: PrioridadeTarefa;
  label: string;
}[] = [
  { valor: 'alta', label: 'Alta' },
  { valor: 'media', label: 'Média' },
  { valor: 'baixa', label: 'Baixa' },
];

const CATEGORIAS: {
  valor: CategoriaTarefa;
  label: string;
}[] = [
  { valor: 'buffet', label: 'Buffet' },
  { valor: 'decoracao', label: 'Decoração' },
  { valor: 'vestuario', label: 'Vestuário' },
  { valor: 'fotografia', label: 'Fotografia' },
  { valor: 'musica', label: 'Música' },
  { valor: 'local', label: 'Local' },
  { valor: 'convites', label: 'Convites' },
  { valor: 'outros', label: 'Outros' },
];

const STATUS: {
  valor: StatusTarefa;
  label: string;
}[] = [
  { valor: 'pendente', label: 'Pendente' },
  { valor: 'em_andamento', label: 'Em andamento' },
  { valor: 'concluida', label: 'Concluída' },
];

const PRIORIDADE_COR: Record<PrioridadeTarefa, string> = {
  alta: '#e74c3c',
  media: '#f39c12',
  baixa: '#27ae60',
};

const STATUS_COR: Record<StatusTarefa, string> = {
  pendente: '#f5f5f5',
  em_andamento: '#fff3e0',
  concluida: '#e8f5e9',
};

function mascararData(valor: string): string {
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8);

  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  }

  if (apenasNumeros.length <= 4) {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
  }

  return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4)}`;
}

function ordenarTarefas(
  tarefas: TarefaViewModel[],
): TarefaViewModel[] {
  return [...tarefas].sort((a, b) => {
    if (a.atrasada !== b.atrasada) {
      return a.atrasada ? -1 : 1;
    }

    if (a.proximaDoPrazo !== b.proximaDoPrazo) {
      return a.proximaDoPrazo ? -1 : 1;
    }

    return a.prazo.localeCompare(b.prazo);
  });
}

export function TarefaView({ presenter }: Props) {
  const [tarefas, setTarefas] = useState<TarefaViewModel[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modoFormulario, setModoFormulario] =
    useState<ModoFormulario>('cadastro');
  const [tarefaEditando, setTarefaEditando] =
    useState<TarefaViewModel | null>(null);
  const [modalDetalhe, setModalDetalhe] =
    useState<TarefaViewModel | null>(null);

  const [filtroStatus, setFiltroStatus] =
    useState<Filtro<StatusTarefa>>('todos');
  const [filtroPrioridade, setFiltroPrioridade] =
    useState<Filtro<PrioridadeTarefa>>('todos');
  const [filtroCategoria, setFiltroCategoria] =
    useState<Filtro<CategoriaTarefa>>('todos');

  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] =
    useState<CategoriaTarefa>('outros');
  const [prioridade, setPrioridade] =
    useState<PrioridadeTarefa>('media');
  const [prazo, setPrazo] = useState('');
  const [responsavel, setResponsavel] = useState('');

  const [feedback, setFeedback] = useState<FeedbackState>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: '',
  });

  useEffect(() => {
    const view: ITarefaView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),

      showError: (message) => {
        setFeedback({
          visivel: true,
          tipo: 'erro',
          titulo: 'Erro',
          mensagem: message,
        });
      },

      showSuccess: (message) => {
        setFeedback({
          visivel: true,
          tipo: 'sucesso',
          titulo: 'Sucesso',
          mensagem: message,
        });
      },

      onTarefasCarregadas: (lista) => {
        setTarefas(ordenarTarefas(lista));
      },

      onTarefaCadastrada: (tarefa) => {
        setTarefas((anteriores) =>
          ordenarTarefas([...anteriores, tarefa]),
        );
        fecharFormulario();
      },

      onTarefaAtualizada: (tarefa) => {
        setTarefas((anteriores) =>
          ordenarTarefas(
            anteriores.map((item) =>
              item.id === tarefa.id ? tarefa : item,
            ),
          ),
        );

        setModalDetalhe((atual) =>
          atual?.id === tarefa.id ? tarefa : atual,
        );

        fecharFormulario();
      },

      onTarefaRemovida: (id) => {
        setTarefas((anteriores) =>
          anteriores.filter((tarefa) => tarefa.id !== id),
        );
        setModalDetalhe(null);
      },
    };

    presenter.attachView(view);
    presenter.carregarTarefas();

    return () => {
      presenter.detachView();
    };
  }, [presenter]);

  const tarefasFiltradas = useMemo(() => {
    return ordenarTarefas(
      tarefas.filter((tarefa) => {
        if (
          filtroStatus !== 'todos' &&
          tarefa.status !== filtroStatus
        ) {
          return false;
        }

        if (
          filtroPrioridade !== 'todos' &&
          tarefa.prioridade !== filtroPrioridade
        ) {
          return false;
        }

        if (
          filtroCategoria !== 'todos' &&
          tarefa.categoria !== filtroCategoria
        ) {
          return false;
        }

        return true;
      }),
    );
  }, [
    tarefas,
    filtroStatus,
    filtroPrioridade,
    filtroCategoria,
  ]);

  function limparFormulario() {
    setDescricao('');
    setCategoria('outros');
    setPrioridade('media');
    setPrazo('');
    setResponsavel('');
    setTarefaEditando(null);
  }

  function abrirCadastro() {
    limparFormulario();
    setModoFormulario('cadastro');
    setModalFormulario(true);
  }

  function abrirEdicao(tarefa: TarefaViewModel) {
    setTarefaEditando(tarefa);
    setModoFormulario('edicao');

    setDescricao(tarefa.descricao);
    setCategoria(tarefa.categoria);
    setPrioridade(tarefa.prioridade);
    setPrazo(tarefa.prazoFormatado);
    setResponsavel(tarefa.responsavel);

    setModalDetalhe(null);
    setModalFormulario(true);
  }

  function fecharFormulario() {
    setModalFormulario(false);
    limparFormulario();
  }

  function fecharFeedback() {
    setFeedback({
      visivel: false,
      tipo: 'sucesso',
      titulo: '',
      mensagem: '',
    });
  }

  function confirmarRemocao(tarefa: TarefaViewModel) {
    setModalDetalhe(null);

    setFeedback({
      visivel: true,
      tipo: 'confirmacao',
      titulo: 'Remover tarefa',
      mensagem: `Deseja remover a tarefa "${tarefa.descricao}"?`,
      textoConfirmar: 'Remover',
      onConfirm: () => {
        fecharFeedback();
        presenter.handleRemover(tarefa.id);
      },
    });
  }

  function handleSalvar() {
    if (modoFormulario === 'cadastro') {
      presenter.handleCadastrar(
        descricao,
        categoria,
        prioridade,
        prazo,
        responsavel,
      );
      return;
    }

    if (!tarefaEditando) {
      setFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro',
        mensagem: 'Nenhuma tarefa foi selecionada para edição.',
      });
      return;
    }

    presenter.handleEditar(tarefaEditando.id, {
      descricao,
      categoria,
      prioridade,
      prazo,
      responsavel,
    });
  }

  function renderTarefa({
    item,
  }: {
    item: TarefaViewModel;
  }) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          item.atrasada && styles.cardAtrasada,
          item.proximaDoPrazo && styles.cardProxima,
        ]}
        onPress={() => setModalDetalhe(item)}
      >
        <View
          style={[
            styles.prioridadeBarra,
            {
              backgroundColor: PRIORIDADE_COR[item.prioridade],
            },
          ]}
        />

        <View style={styles.cardConteudo}>
          <View style={styles.cardTopo}>
            <Text
              style={[
                styles.descricao,
                item.status === 'concluida' &&
                  styles.descricaoConcluida,
              ]}
            >
              {item.descricao}
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: STATUS_COR[item.status],
                },
              ]}
            >
              <Text style={styles.statusTexto}>
                {item.statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.tagsLinha}>
            <Text style={styles.tagTexto}>
              {item.categoriaLabel}
            </Text>

            <Text
              style={[
                styles.tagTexto,
                {
                  color: PRIORIDADE_COR[item.prioridade],
                },
              ]}
            >
              {item.prioridadeLabel}
            </Text>
          </View>

          <View style={styles.cardRodape}>
            <Text style={styles.infoTexto}>
              Prazo: {item.prazoFormatado}
            </Text>

            <Text style={styles.infoTexto}>
              Responsável: {item.responsavel}
            </Text>
          </View>

          {item.atrasada && (
            <Text style={styles.alertaAtrasada}>
              Tarefa atrasada
            </Text>
          )}

          {!item.atrasada && item.proximaDoPrazo && (
            <Text style={styles.alertaProxima}>
              Prazo próximo
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Tarefas</Text>
          <Text style={styles.subtitulo}>
            Checklist de organização do evento
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnNovo}
          onPress={abrirCadastro}
        >
          <Text style={styles.btnNovoText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[
              styles.filtroBtn,
              filtroStatus === 'todos' && styles.filtroBtnAtivo,
            ]}
            onPress={() => setFiltroStatus('todos')}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtroStatus === 'todos' &&
                  styles.filtroTextoAtivo,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {STATUS.map((statusItem) => (
            <TouchableOpacity
              key={statusItem.valor}
              style={[
                styles.filtroBtn,
                filtroStatus === statusItem.valor &&
                  styles.filtroBtnAtivo,
              ]}
              onPress={() => setFiltroStatus(statusItem.valor)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroStatus === statusItem.valor &&
                    styles.filtroTextoAtivo,
                ]}
              >
                {statusItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[
              styles.filtroBtn,
              filtroCategoria === 'todos' &&
                styles.filtroBtnAtivo,
            ]}
            onPress={() => setFiltroCategoria('todos')}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtroCategoria === 'todos' &&
                  styles.filtroTextoAtivo,
              ]}
            >
              Todas categorias
            </Text>
          </TouchableOpacity>

          {CATEGORIAS.map((categoriaItem) => (
            <TouchableOpacity
              key={categoriaItem.valor}
              style={[
                styles.filtroBtn,
                filtroCategoria === categoriaItem.valor &&
                  styles.filtroBtnAtivo,
              ]}
              onPress={() =>
                setFiltroCategoria(categoriaItem.valor)
              }
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroCategoria === categoriaItem.valor &&
                    styles.filtroTextoAtivo,
                ]}
              >
                {categoriaItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[
              styles.filtroBtn,
              filtroPrioridade === 'todos' &&
                styles.filtroBtnAtivo,
            ]}
            onPress={() => setFiltroPrioridade('todos')}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtroPrioridade === 'todos' &&
                  styles.filtroTextoAtivo,
              ]}
            >
              Todas prioridades
            </Text>
          </TouchableOpacity>

          {PRIORIDADES.map((prioridadeItem) => (
            <TouchableOpacity
              key={prioridadeItem.valor}
              style={[
                styles.filtroBtn,
                filtroPrioridade === prioridadeItem.valor && {
                  backgroundColor:
                    PRIORIDADE_COR[prioridadeItem.valor],
                  borderColor:
                    PRIORIDADE_COR[prioridadeItem.valor],
                },
              ]}
              onPress={() =>
                setFiltroPrioridade(prioridadeItem.valor)
              }
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroPrioridade === prioridadeItem.valor && {
                    color: '#fff',
                  },
                ]}
              >
                {prioridadeItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && (
        <ActivityIndicator
          color="#9b59b6"
          style={styles.loading}
        />
      )}

      {!loading && tarefasFiltradas.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>
            Nenhuma tarefa encontrada.
          </Text>
        </View>
      )}

      <FlatList
        data={tarefasFiltradas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTarefa}
        contentContainerStyle={styles.lista}
      />

      <Modal
        visible={modalFormulario}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {modoFormulario === 'cadastro'
                ? 'Nova tarefa'
                : 'Editar tarefa'}
            </Text>

            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Ex.: Confirmar decoração da mesa principal"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />

            <Text style={styles.label}>Categoria *</Text>
            <View style={styles.opcoesContainer}>
              {CATEGORIAS.map((item) => (
                <TouchableOpacity
                  key={item.valor}
                  style={[
                    styles.opcaoBtn,
                    categoria === item.valor &&
                      styles.opcaoBtnAtiva,
                  ]}
                  onPress={() => setCategoria(item.valor)}
                >
                  <Text
                    style={[
                      styles.opcaoTexto,
                      categoria === item.valor &&
                        styles.opcaoTextoAtivo,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Prioridade *</Text>
            <View style={styles.opcoesContainer}>
              {PRIORIDADES.map((item) => (
                <TouchableOpacity
                  key={item.valor}
                  style={[
                    styles.opcaoBtn,
                    prioridade === item.valor && {
                      backgroundColor: PRIORIDADE_COR[item.valor],
                      borderColor: PRIORIDADE_COR[item.valor],
                    },
                  ]}
                  onPress={() => setPrioridade(item.valor)}
                >
                  <Text
                    style={[
                      styles.opcaoTexto,
                      prioridade === item.valor && {
                        color: '#fff',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Prazo da tarefa *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={prazo}
              onChangeText={(valor) =>
                setPrazo(mascararData(valor))
              }
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Responsável *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Mãe, pai, cerimonialista"
              value={responsavel}
              onChangeText={setResponsavel}
            />

            <TouchableOpacity
              style={[
                styles.btnSalvar,
                loading && styles.btnDesabilitado,
              ]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnSalvarText}>
                  {modoFormulario === 'cadastro'
                    ? 'Cadastrar tarefa'
                    : 'Atualizar tarefa'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={fecharFormulario}
            >
              <Text style={styles.btnCancelarText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {modalDetalhe && (
        <Modal
          visible={!!modalDetalhe}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitulo}>
                Detalhes da tarefa
              </Text>

              <Text style={styles.detalheLabel}>Descrição</Text>
              <Text style={styles.detalheValor}>
                {modalDetalhe.descricao}
              </Text>

              <Text style={styles.detalheLabel}>Categoria</Text>
              <Text style={styles.detalheValor}>
                {modalDetalhe.categoriaLabel}
              </Text>

              <Text style={styles.detalheLabel}>Prioridade</Text>
              <Text
                style={[
                  styles.detalheValor,
                  {
                    color:
                      PRIORIDADE_COR[modalDetalhe.prioridade],
                  },
                ]}
              >
                {modalDetalhe.prioridadeLabel}
              </Text>

              <Text style={styles.detalheLabel}>Prazo</Text>
              <Text style={styles.detalheValor}>
                {modalDetalhe.prazoFormatado}
              </Text>

              <Text style={styles.detalheLabel}>Responsável</Text>
              <Text style={styles.detalheValor}>
                {modalDetalhe.responsavel}
              </Text>

              <Text style={styles.detalheLabel}>Atualizar status</Text>
              <View style={styles.statusContainer}>
                {STATUS.map((statusItem) => (
                  <TouchableOpacity
                    key={statusItem.valor}
                    style={[
                      styles.statusBtn,
                      modalDetalhe.status === statusItem.valor &&
                        styles.statusBtnSelecionado,
                    ]}
                    disabled={modalDetalhe.status === statusItem.valor}
                    onPress={async () => {
                      await presenter.handleAtualizarStatus(
                        modalDetalhe.id,
                        statusItem.valor,
                      );

                      setModalDetalhe(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        modalDetalhe.status === statusItem.valor &&
                          styles.statusBtnTextSelecionado,
                      ]}
                    >
                      {statusItem.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modalDetalhe.atrasada && (
                <Text style={styles.alertaAtrasadaDetalhe}>
                  Esta tarefa está atrasada.
                </Text>
              )}

              {!modalDetalhe.atrasada &&
                modalDetalhe.proximaDoPrazo && (
                  <Text style={styles.alertaProximaDetalhe}>
                    Esta tarefa está próxima do prazo.
                  </Text>
                )}

              <TouchableOpacity
                style={styles.btnEditar}
                onPress={() => abrirEdicao(modalDetalhe)}
              >
                <Text style={styles.btnEditarText}>
                  Atualizar tarefa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnRemoverDetalhe}
                onPress={() => confirmarRemocao(modalDetalhe)}
              >
                <Text style={styles.btnRemoverDetalheText}>
                  Remover tarefa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => setModalDetalhe(null)}
              >
                <Text style={styles.btnCancelarText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}

      <Modal
        visible={feedback.visivel}
        animationType="fade"
        transparent
      >
        <View style={styles.feedbackOverlay}>
          <View style={styles.feedbackContent}>
            <Text
              style={[
                styles.feedbackTitulo,
                feedback.tipo === 'erro' && styles.feedbackTituloErro,
              ]}
            >
              {feedback.titulo}
            </Text>

            <Text style={styles.feedbackMensagem}>
              {feedback.mensagem}
            </Text>

            {feedback.tipo === 'confirmacao' ? (
              <View style={styles.feedbackAcoes}>
                <TouchableOpacity
                  style={styles.feedbackCancelar}
                  onPress={fecharFeedback}
                >
                  <Text style={styles.feedbackCancelarText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.feedbackConfirmar}
                  onPress={feedback.onConfirm}
                >
                  <Text style={styles.feedbackConfirmarText}>
                    {feedback.textoConfirmar ?? 'Confirmar'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.feedbackOk}
                onPress={fecharFeedback}
              >
                <Text style={styles.feedbackOkText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    backgroundColor: '#9b59b6',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  subtitulo: {
    fontSize: 12,
    color: '#f2e8f7',
    marginTop: 2,
  },

  btnNovo: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  btnNovoText: {
    color: '#9b59b6',
    fontWeight: 'bold',
  },

  filtrosArea: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  filtroBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },

  filtroBtnAtivo: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },

  filtroTexto: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  filtroTextoAtivo: {
    color: '#fff',
  },

  loading: {
    marginTop: 20,
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },

  vazioText: {
    fontSize: 16,
    color: '#888',
  },

  lista: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
  },

  cardAtrasada: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },

  cardProxima: {
    borderWidth: 1,
    borderColor: '#f39c12',
  },

  prioridadeBarra: {
    width: 5,
  },

  cardConteudo: {
    flex: 1,
    padding: 14,
  },

  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  descricao: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginRight: 8,
  },

  descricaoConcluida: {
    color: '#999',
    textDecorationLine: 'line-through',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusTexto: {
    fontSize: 11,
    color: '#555',
    fontWeight: '700',
  },

  tagsLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  tagTexto: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
    fontWeight: '600',
  },

  cardRodape: {
    marginTop: 6,
  },

  infoTexto: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  alertaAtrasada: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },

  alertaProxima: {
    color: '#f39c12',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9b59b6',
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: '#555',
    fontWeight: '700',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: '#fff',
  },

  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },

  opcaoBtn: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },

  opcaoBtnAtiva: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },

  opcaoTexto: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },

  opcaoTextoAtivo: {
    color: '#fff',
  },

  btnSalvar: {
    backgroundColor: '#9b59b6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },

  btnDesabilitado: {
    opacity: 0.7,
  },

  btnSalvarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  btnCancelar: {
    padding: 14,
    alignItems: 'center',
  },

  btnCancelarText: {
    color: '#777',
    fontSize: 15,
    fontWeight: '600',
  },

  detalheLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    marginBottom: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
  },

  detalheValor: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

  statusContainer: {
    marginTop: 8,
    marginBottom: 8,
  },

  statusBtn: {
    padding: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#9b59b6',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusBtnSelecionado: {
    backgroundColor: '#9b59b6',
  },

  statusBtnText: {
    color: '#9b59b6',
    fontWeight: '700',
  },

  statusBtnTextSelecionado: {
    color: '#fff',
  },

  alertaAtrasadaDetalhe: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginTop: 10,
  },

  alertaProximaDetalhe: {
    color: '#f39c12',
    fontWeight: 'bold',
    marginTop: 10,
  },

  btnEditar: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },

  btnEditarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  btnRemoverDetalhe: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e74c3c',
    alignItems: 'center',
    marginBottom: 4,
  },

  btnRemoverDetalheText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },

  feedbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  feedbackContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
  },

  feedbackTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9b59b6',
    marginBottom: 8,
  },

  feedbackTituloErro: {
    color: '#e74c3c',
  },

  feedbackMensagem: {
    fontSize: 15,
    color: '#444',
    lineHeight: 21,
    marginBottom: 18,
  },

  feedbackAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  feedbackCancelar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },

  feedbackCancelarText: {
    color: '#777',
    fontWeight: '700',
  },

  feedbackConfirmar: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  feedbackConfirmarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  feedbackOk: {
    alignSelf: 'flex-end',
    backgroundColor: '#9b59b6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },

  feedbackOkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});






