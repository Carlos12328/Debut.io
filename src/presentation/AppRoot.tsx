import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoginScreen } from './modules/login/LoginScreen';
import { CadastroScreen } from './modules/cadastro/CadastroScreen';
import { Usuario } from '../domain/models';
import { getDatabase } from '../persistence/db';

type Tela = 'login' | 'cadastro';

export default function AppRoot() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [dbPronto, setDbPronto] = useState(false);

  useEffect(() => {
    getDatabase()
      .then(() => setDbPronto(true))
      .catch(err => {
        console.error('[DB ERROR]', err);
        setDbPronto(true);
      });
  }, []);

  if (!dbPronto) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (usuarioLogado) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Bem-vindo, {usuarioLogado.nome}! 🎉</Text>
      </View>
    );
  }

  if (telaAtual === 'cadastro') {
    return (
      <CadastroScreen
        onCadastroSuccess={() => setTelaAtual('login')}
        onVoltarLogin={() => setTelaAtual('login')}
      />
    );
  }

  return (
    <LoginScreen
      onLoginSuccess={setUsuarioLogado}
      onIrParaCadastro={() => setTelaAtual('cadastro')}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, color: '#9b59b6' },
});
