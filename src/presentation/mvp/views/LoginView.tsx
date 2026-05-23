import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, } from 'react-native';
import { LoginPresenter, LoginView as ILoginView } from '../presenters/LoginPresenter';
import { Usuario } from '../../../domain/models';
import { SafeScreen } from '../../components/SafeScreen';

interface Props {
  presenter: LoginPresenter;
  onLoginSuccess: (usuario: Usuario) => void;
  onIrParaCadastro: () => void;
}

export function LoginView({ presenter, onLoginSuccess, onIrParaCadastro }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const view: ILoginView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => Alert.alert('Erro', msg),
      onLoginSuccess,
    };
    presenter.attachView(view);
    return () => presenter.detachView();
  }, [presenter, onLoginSuccess]);

  return (
    <SafeScreen>
      <View style={styles.inner}>
        <Text style={styles.title}>Debut.io</Text>
        <Text style={styles.subtitle}>Acesse sua conta</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => presenter.handleLogin(email, senha)}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={onIrParaCadastro} style={styles.linkContainer}>
          <Text style={styles.link}>Nao tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#9b59b6', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { alignItems: 'center', marginTop: 16 },
  link: { color: '#9b59b6', fontSize: 14 },
});