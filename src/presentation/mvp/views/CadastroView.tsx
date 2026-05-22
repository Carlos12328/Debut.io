import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { CadastroPresenter, CadastroView as ICadastroView } from '../presenters/CadastroPresenter';
import { Usuario, PerfilUsuario } from '../../../domain/models';

interface Props {
  presenter: CadastroPresenter;
  onCadastroSuccess: (usuario: Usuario) => void;
  onVoltarLogin: () => void;
}

export function CadastroView({ presenter, onCadastroSuccess, onVoltarLogin }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('familiar');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [erroData, setErroData] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const view: ICadastroView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onCadastroSuccess,
    };
    presenter.attachView(view);
    return () => presenter.detachView();
  }, [presenter, onCadastroSuccess]);

  const aplicarMascaraData = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  const aplicarMascaraCpf = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  };

  const aplicarMascaraCep = (valor: string): string => {
    const n = valor.replace(/\D/g, '').slice(0, 8);
    if (n.length <= 5) return n;
    return `${n.slice(0, 5)}-${n.slice(5)}`;
  };

  const validarDataNascimento = (data: string): string => {
    // Precisa estar completa DD/MM/AAAA
    if (data.length < 10) return '';

    const [ddStr, mmStr, aaaaStr] = data.split('/');
    const dd = parseInt(ddStr, 10);
    const mm = parseInt(mmStr, 10);
    const aaaa = parseInt(aaaaStr, 10);


    if (mm < 1 || mm > 12) return 'Mes invalido. Use um valor entre 01 e 12.';


    const diasNoMes = new Date(aaaa, mm, 0).getDate();
    if (dd < 1 || dd > diasNoMes) return `Dia invalido para o mes informado. Maximo: ${diasNoMes} dias.`;

    if (aaaaStr.length !== 4 || aaaa < 1900) return 'Ano invalido.';

    const hoje = new Date();
    const nascimento = new Date(aaaa, mm - 1, dd);

    if (nascimento > hoje) return 'Data de nascimento nao pode ser no futuro.';

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();
    if (mesAtual < mm || (mesAtual === mm && diaAtual < dd)) {
      idade--;
    }

    if (idade < 18) return 'Voce deve ter pelo menos 18 anos para se cadastrar.';

    if (idade > 100) return 'Data de nascimento invalida.';

    return ''; // sem erro
  };

  const handleChangeData = (texto: string) => {
    const formatado = aplicarMascaraData(texto);
    setDataNascimento(formatado);
    if (formatado.length === 10) {
      setErroData(validarDataNascimento(formatado));
    } else {
      setErroData('');
    }
  };

  const handleCadastrar = () => {
    const erroDataFinal = validarDataNascimento(dataNascimento);
    if (dataNascimento.length === 10 && erroDataFinal) {
      Alert.alert('Data invalida', erroDataFinal);
      return;
    }

    let dataBanco = '';
    if (dataNascimento.length === 10) {
      const [dd, mm, aaaa] = dataNascimento.split('/');
      dataBanco = `${aaaa}-${mm}-${dd}`;
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const cepLimpo = cep.replace(/\D/g, '');

    presenter.handleCadastro(
      nome, email, senha, confirmarSenha, perfil,
      cpfLimpo, dataBanco || dataNascimento,
      logradouro, numero, bairro, cidade, estado, cepLimpo
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Debut.io</Text>
      <Text style={styles.subtitle}>Criar conta</Text>

      <Text style={styles.sectionTitle}>Dados pessoais</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo *"
        value={nome}
        onChangeText={setNome}
        maxLength={80}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail *"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        maxLength={100}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF * (000.000.000-00)"
        value={cpf}
        onChangeText={(texto) => setCpf(aplicarMascaraCpf(texto))}
        keyboardType="numeric"
        maxLength={14}
      />

      <TextInput
        style={[styles.input, erroData ? styles.inputErro : null]}
        placeholder="Data de nascimento (DD/MM/AAAA)"
        value={dataNascimento}
        onChangeText={handleChangeData}
        keyboardType="numeric"
        maxLength={10}
      />
      {erroData ? (
        <Text style={styles.textoErro}>{erroData}</Text>
      ) : (
        <Text style={styles.textoHint}>* Obrigatorio ser maior de 18 anos</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Senha *"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        maxLength={50}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha *"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        maxLength={50}
      />

      <Text style={styles.label}>Perfil</Text>
      <View style={styles.perfilContainer}>
        {(['familiar', 'cerimonialista'] as PerfilUsuario[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.perfilBtn, perfil === p && styles.perfilBtnAtivo]}
            onPress={() => setPerfil(p)}
          >
            <Text style={[styles.perfilBtnText, perfil === p && styles.perfilBtnTextAtivo]}>
              {p === 'familiar' ? 'Familiar' : 'Cerimonialista'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Endereco</Text>

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
        maxLength={100}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputNumero]}
          placeholder="Numero"
          value={numero}
          onChangeText={setNumero}
          keyboardType="numeric"
          maxLength={10}
        />
        <TextInput
          style={[styles.input, styles.inputBairro]}
          placeholder="Bairro"
          value={bairro}
          onChangeText={setBairro}
          maxLength={60}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputCidade]}
          placeholder="Cidade"
          value={cidade}
          onChangeText={setCidade}
          maxLength={60}
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
        style={styles.button}
        onPress={handleCadastrar}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Cadastrar</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={onVoltarLogin} style={styles.linkContainer}>
        <Text style={styles.link}>Ja tem conta? Entrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#9b59b6', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#9b59b6', marginBottom: 12, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16 },
  inputErro: { borderColor: '#e74c3c' },
  textoErro: { fontSize: 12, color: '#e74c3c', marginBottom: 12, marginTop: 2, fontStyle: 'italic' },
  textoHint: { fontSize: 12, color: '#aaa', marginBottom: 12, marginTop: 2, fontStyle: 'italic' },
  label: { fontSize: 14, color: '#555', marginBottom: 8, marginTop: 4 },
  perfilContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  perfilBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#9b59b6', alignItems: 'center' },
  perfilBtnAtivo: { backgroundColor: '#9b59b6' },
  perfilBtnText: { color: '#9b59b6', fontWeight: '600' },
  perfilBtnTextAtivo: { color: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  inputNumero: { flex: 1 },
  inputBairro: { flex: 2 },
  inputCidade: { flex: 2 },
  inputEstado: { flex: 1 },
  button: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { alignItems: 'center' },
  link: { color: '#9b59b6', fontSize: 14 },
});