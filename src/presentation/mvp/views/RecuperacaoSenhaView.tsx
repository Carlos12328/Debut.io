import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import {
  RecuperacaoSenhaPresenter,
  RecuperacaoSenhaView as IRecuperacaoSenhaView,
} from '../presenters/RecuperacaoSenhaPresenter';
import { SafeScreen } from '../../components/SafeScreen';

interface Props {
  presenter: RecuperacaoSenhaPresenter;
  onVoltarLogin: () => void;
}

export function RecuperacaoSenhaView({ presenter, onVoltarLogin }: Props) {
  const [etapa, setEtapa] = useState<'email' | 'nova-senha'>('email');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const view: IRecuperacaoSenhaView = {
      showLoading: () => { setLoading(true); setErro(null); },
      hideLoading: () => setLoading(false),
      showError: (msg) => setErro(msg),
      onEmailVerificado: () => { setErro(null); setEtapa('nova-senha'); },
      onSenhaRedefinida: () => {
        setErro(null);
        onVoltarLogin();
      },
    };
    presenter.attachView(view);
    return () => presenter.detachView();
  }, [presenter, onVoltarLogin]);

  return (
    <SafeScreen>
      <View style={styles.inner}>
        <Text style={styles.title}>Debut.io</Text>
        <Text style={styles.subtitle}>
          {etapa === 'email' ? 'Recuperar senha' : 'Nova senha'}
        </Text>

        {etapa === 'email' ? (
          <>
            <Text style={styles.instrucao}>
              Informe o e-mail cadastrado na sua conta.
            </Text>

            <TextInput
              style={[styles.input, erro ? styles.inputErro : null]}
              placeholder="E-mail"
              value={email}
              onChangeText={(t) => { setEmail(t); setErro(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {erro && (
              <View style={styles.erroContainer}>
                <Text style={styles.erroTexto}>{erro}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDesabilitado]}
              onPress={() => presenter.handleVerificarEmail(email)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Verificar e-mail</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instrucao}>
              Crie uma nova senha para a conta{'\n'}
              <Text style={styles.emailDestaque}>{email}</Text>
            </Text>

            <TextInput
              style={[styles.input, erro ? styles.inputErro : null]}
              placeholder="Nova senha"
              value={novaSenha}
              onChangeText={(t) => { setNovaSenha(t); setErro(null); }}
              secureTextEntry
              maxLength={50}
            />
            <TextInput
              style={[styles.input, erro ? styles.inputErro : null]}
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChangeText={(t) => { setConfirmarSenha(t); setErro(null); }}
              secureTextEntry
              maxLength={50}
            />

            {erro && (
              <View style={styles.erroContainer}>
                <Text style={styles.erroTexto}>{erro}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDesabilitado]}
              onPress={() => presenter.handleRedefinirSenha(email, novaSenha, confirmarSenha)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Redefinir senha</Text>
              }
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={onVoltarLogin} style={styles.linkContainer}>
          <Text style={styles.link}>Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#9b59b6', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 24 },
  instrucao: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emailDestaque: { fontWeight: 'bold', color: '#9b59b6' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 16 },
  inputErro: { borderColor: '#e74c3c' },
  erroContainer: { backgroundColor: '#fdf0ee', borderRadius: 8, padding: 10, marginBottom: 16 },
  erroTexto: { color: '#c0392b', fontSize: 13, lineHeight: 18 },
  button: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonDesabilitado: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { alignItems: 'center', marginTop: 16 },
  link: { color: '#9b59b6', fontSize: 14 },
});
