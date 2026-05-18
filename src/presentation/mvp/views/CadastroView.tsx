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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Debut.io</Text>
      <Text style={styles.subtitle}>Criar conta</Text>

      <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirmar senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />

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

      <TouchableOpacity
        style={styles.button}
        onPress={() => presenter.handleCadastro(nome, email, senha, confirmarSenha, perfil)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onVoltarLogin} style={styles.linkContainer}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#9b59b6', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  label: { fontSize: 14, color: '#555', marginBottom: 8 },
  perfilContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  perfilBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#9b59b6', alignItems: 'center' },
  perfilBtnAtivo: { backgroundColor: '#9b59b6' },
  perfilBtnText: { color: '#9b59b6', fontWeight: '600' },
  perfilBtnTextAtivo: { color: '#fff' },
  button: { backgroundColor: '#9b59b6', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { alignItems: 'center' },
  link: { color: '#9b59b6', fontSize: 14 },
});
