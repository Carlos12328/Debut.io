import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import {
  CompromissoPresenter,
  CompromissoView as ICompromissoView,
} from '../presenters/CompromissoPresenter';
import { Compromisso } from '../../../domain/models';

interface Props {
  presenter: CompromissoPresenter;
}

type ModoFormulario = 'cadastro' | 'edicao';
type TipoFeedback = 'sucesso' | 'erro';

interface Feedback {
  visivel: boolean;
  tipo: TipoFeedback;
  titulo: string;
  mensagem: string;
}

function ordenarCompromissos(lista: Compromisso[]) {
  return [...lista].sort((a, b) => {
    const dataA = `${a.data_compromisso} ${a.horario ?? '00:00'}`;
    const dataB = `${b.data_compromisso} ${b.horario ?? '00:00'}`;

    return dataA.localeCompare(dataB);
  });
}

function formatarData(data: string) {
  if (!data) return 'Sem data';

  const partes = data.split('-');

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario?: string | null) {
  if (!horario) {
    return 'Sem horário';
  }

  return horario.slice(0, 5);
}

function aplicarMascaraData(valor: string) {
  const somenteNumeros = valor.replace(/\D/g, '').slice(0, 8);

  if (somenteNumeros.length <= 2) {
    return somenteNumeros;
  }

  if (somenteNumeros.length <= 4) {
    return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
  }

  return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2, 4)}/${somenteNumeros.slice(4)}`;
}

function aplicarMascaraHorario(valor: string) {
  const somenteNumeros = valor.replace(/\D/g, '').slice(0, 4);

  if (somenteNumeros.length <= 2) {
    return somenteNumeros;
  }

  return `${somenteNumeros.slice(0, 2)}:${somenteNumeros.slice(2)}`;
}

export function CompromissoView({ presenter }: Props) {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>('cadastro');
  const [compromissoEditando, setCompromissoEditando] = useState<Compromisso | null>(null);
  const [compromissoParaRemover, setCompromissoParaRemover] = useState<Compromisso | null>(null);

  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [alertaConfigurado, setAlertaConfigurado] = useState(true);

  const [feedback, setFeedback] = useState<Feedback>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: '',
  });

  useEffect(() => {
    const view: ICompromissoView = {
      showLoading: () => setLoading(true),

      hideLoading: () => setLoading(false),

      showError: (msg) => {
        mostrarFeedback('erro', 'Erro', msg);
      },

      onCompromissosCarregados: (lista) => {
        setCompromissos(ordenarCompromissos(lista));
      },

      onCompromissoCadastrado: (compromisso) => {
        setCompromissos((prev) =>
          ordenarCompromissos([...prev, compromisso]),
        );
        fecharFormulario();
        mostrarFeedback('sucesso', 'Sucesso', 'Compromisso cadastrado com sucesso.');
      },

      onCompromissoAtualizado: (compromisso) => {
        setCompromissos((prev) =>
          ordenarCompromissos(
            prev.map((item) =>
              item.id_compromisso === compromisso.id_compromisso
                ? compromisso
                : item,
            ),
          ),
        );
        fecharFormulario();
        mostrarFeedback('sucesso', 'Sucesso', 'Compromisso atualizado com sucesso.');
      },

      onCompromissoRemovido: (id) => {
        setCompromissos((prev) =>
          prev.filter((item) => item.id_compromisso !== id),
        );
        mostrarFeedback('sucesso', 'Sucesso', 'Compromisso removido com sucesso.');
      },
    };

    presenter.attachView(view);
    presenter.carregarCompromissos();

    return () => presenter.detachView();
  }, [presenter]);

  function mostrarFeedback(
    tipo: TipoFeedback,
    titulo: string,
    mensagem: string,
  ) {
    setFeedback({
      visivel: true,
      tipo,
      titulo,
      mensagem,
    });
  }

  function fecharFeedback() {
    setFeedback((prev) => ({
      ...prev,
      visivel: false,
    }));
  }

  function limparFormulario() {
    setDescricao('');
    setData('');
    setHorario('');
    setObservacoes('');
    setAlertaConfigurado(true);
    setCompromissoEditando(null);
    setModoFormulario('cadastro');
  }

  function abrirCadastro() {
    limparFormulario();
    setModoFormulario('cadastro');
    setModalVisivel(true);
  }

  function abrirEdicao(compromisso: Compromisso) {
    const partesData = compromisso.data_compromisso.split('-');

    setModoFormulario('edicao');
    setCompromissoEditando(compromisso);
    setDescricao(compromisso.descricao);
    setData(
      partesData.length === 3
        ? `${partesData[2]}/${partesData[1]}/${partesData[0]}`
        : compromisso.data_compromisso,
    );
    setHorario(compromisso.horario ? compromisso.horario.slice(0, 5) : '');
    setObservacoes(compromisso.observacoes ?? '');
    setAlertaConfigurado(compromisso.alerta_configurado ?? true);
    setModalVisivel(true);
  }

  function fecharFormulario() {
    setModalVisivel(false);
    limparFormulario();
  }

  function salvarCompromisso() {
    if (modoFormulario === 'edicao' && compromissoEditando) {
      presenter.handleAtualizar(
        compromissoEditando.id_compromisso,
        descricao,
        data,
        horario,
        observacoes,
        alertaConfigurado,
      );
      return;
    }

    presenter.handleCadastrar(
      descricao,
      data,
      horario,
      observacoes,
      alertaConfigurado,
    );
  }

  function solicitarRemocao(compromisso: Compromisso) {
    setCompromissoParaRemover(compromisso);
  }

  function cancelarRemocao() {
    setCompromissoParaRemover(null);
  }

  function confirmarRemocao() {
    if (!compromissoParaRemover) {
      return;
    }

    const id = compromissoParaRemover.id_compromisso;

    setCompromissoParaRemover(null);
    presenter.handleRemover(id);
  }

  function renderCompromisso({ item }: { item: Compromisso }) {
    return (
      <View style={styles.card}>
        <View style={styles.dataContainer}>
          <Text style={styles.dataTexto}>
            {formatarData(item.data_compromisso)}
          </Text>
          <Text style={styles.horarioTexto}>
            {formatarHorario(item.horario)}
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.descricao}>{item.descricao}</Text>

          {!!item.observacoes && (
            <Text style={styles.observacoes}>
              {item.observacoes}
            </Text>
          )}

          <Text style={styles.alertaTexto}>
            {item.alerta_configurado ? 'Alerta ativado' : 'Sem alerta'}
          </Text>
        </View>

        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.btnAcao}
            onPress={() => abrirEdicao(item)}
          >
            <Text style={styles.btnEditar}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnAcao}
            onPress={() => solicitarRemocao(item)}
          >
            <Text style={styles.btnRemover}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Agenda</Text>

        <TouchableOpacity
          style={styles.btnNovo}
          onPress={abrirCadastro}
        >
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          color="#9b59b6"
          style={styles.loading}
        />
      )}

      {!loading && compromissos.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>
            Nenhum compromisso cadastrado.
          </Text>
        </View>
      )}

      <FlatList
        data={compromissos}
        keyExtractor={(item) => item.id_compromisso.toString()}
        renderItem={renderCompromisso}
        contentContainerStyle={styles.lista}
      />

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent
        onRequestClose={fecharFormulario}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {modoFormulario === 'cadastro'
                ? 'Novo compromisso'
                : 'Editar compromisso'}
            </Text>

            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Prova de vestido"
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={styles.label}>Data *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={data}
              onChangeText={(valor) => setData(aplicarMascaraData(valor))}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Horário</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={horario}
              onChangeText={(valor) => setHorario(aplicarMascaraHorario(valor))}
              keyboardType="numeric"
              maxLength={5}
            />

            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Ex.: Levar contrato, documentos ou comprovante."
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.labelSwitch}>Alerta do compromisso</Text>
                <Text style={styles.switchDescricao}>
                  Usado futuramente para lembrar compromissos próximos.
                </Text>
              </View>

              <Switch
                value={alertaConfigurado}
                onValueChange={setAlertaConfigurado}
              />
            </View>

            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={salvarCompromisso}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnSalvarText}>
                  {modoFormulario === 'cadastro' ? 'Salvar' : 'Atualizar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={fecharFormulario}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={!!compromissoParaRemover}
        animationType="fade"
        transparent
        onRequestClose={cancelarRemocao}
      >
        <View style={styles.modalCentralizadoOverlay}>
          <View style={styles.modalCentralizadoCard}>
            <Text style={styles.confirmacaoTitulo}>
              Remover compromisso
            </Text>

            <Text style={styles.confirmacaoMensagem}>
              Deseja remover "{compromissoParaRemover?.descricao}"?
            </Text>

            <View style={styles.confirmacaoAcoes}>
              <TouchableOpacity
                style={styles.btnConfirmacaoCancelar}
                onPress={cancelarRemocao}
              >
                <Text style={styles.btnConfirmacaoCancelarText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnConfirmacaoRemover}
                onPress={confirmarRemocao}
              >
                <Text style={styles.btnConfirmacaoRemoverText}>
                  Remover
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={feedback.visivel}
        animationType="fade"
        transparent
        onRequestClose={fecharFeedback}
      >
        <View style={styles.modalCentralizadoOverlay}>
          <View style={styles.modalCentralizadoCard}>
            <View
              style={[
                styles.feedbackIndicador,
                feedback.tipo === 'erro'
                  ? styles.feedbackIndicadorErro
                  : styles.feedbackIndicadorSucesso,
              ]}
            />

            <Text style={styles.feedbackTitulo}>
              {feedback.titulo}
            </Text>

            <Text style={styles.feedbackMensagem}>
              {feedback.mensagem}
            </Text>

            <TouchableOpacity
              style={[
                styles.btnFeedback,
                feedback.tipo === 'erro'
                  ? styles.btnFeedbackErro
                  : styles.btnFeedbackSucesso,
              ]}
              onPress={fecharFeedback}
            >
              <Text style={styles.btnFeedbackText}>
                OK
              </Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#9b59b6',
  },

  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  btnNovo: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  btnNovoText: {
    color: '#9b59b6',
    fontWeight: 'bold',
  },

  loading: {
    marginTop: 20,
  },

  lista: {
    padding: 16,
    gap: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  dataContainer: {
    backgroundColor: '#f0e6fa',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 78,
  },

  dataTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9b59b6',
    textAlign: 'center',
  },

  horarioTexto: {
    fontSize: 11,
    color: '#9b59b6',
    marginTop: 4,
  },

  cardInfo: {
    flex: 1,
  },

  descricao: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },

  observacoes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  alertaTexto: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
  },

  acoes: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  btnAcao: {
    paddingVertical: 3,
  },

  btnEditar: {
    color: '#9b59b6',
    fontSize: 12,
    fontWeight: 'bold',
  },

  btnRemover: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'bold',
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },

  vazioText: {
    fontSize: 16,
    color: '#888',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9b59b6',
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  inputMultiline: {
    minHeight: 90,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    gap: 16,
  },

  labelSwitch: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },

  switchDescricao: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    maxWidth: 230,
  },

  btnSalvar: {
    backgroundColor: '#9b59b6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
    color: '#888',
    fontSize: 16,
  },

  modalCentralizadoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalCentralizadoCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },

  confirmacaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },

  confirmacaoMensagem: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 22,
  },

  confirmacaoAcoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },

  btnConfirmacaoCancelar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },

  btnConfirmacaoCancelarText: {
    color: '#555',
    fontWeight: 'bold',
  },

  btnConfirmacaoRemover: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
  },

  btnConfirmacaoRemoverText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  feedbackIndicador: {
    width: 48,
    height: 5,
    borderRadius: 999,
    marginBottom: 16,
  },

  feedbackIndicadorSucesso: {
    backgroundColor: '#27ae60',
  },

  feedbackIndicadorErro: {
    backgroundColor: '#e74c3c',
  },

  feedbackTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },

  feedbackMensagem: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 22,
  },

  btnFeedback: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
  },

  btnFeedbackSucesso: {
    backgroundColor: '#27ae60',
  },

  btnFeedbackErro: {
    backgroundColor: '#e74c3c',
  },

  btnFeedbackText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
