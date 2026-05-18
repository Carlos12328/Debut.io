import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoginScreen } from './modules/login/LoginScreen';
import { CadastroScreen } from './modules/cadastro/CadastroScreen';
import { EventoScreen } from './modules/eventos/EventoScreen';
import { MainScreen } from './modules/main/MainScreen';
import { Usuario, Evento } from '../domain/models';
import { getDatabase } from '../persistence/db';

type Tela = 'login' | 'cadastro' | 'eventos' | 'main';

export default function AppRoot() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
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

  if (!usuarioLogado) {
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
        onLoginSuccess={(u) => { setUsuarioLogado(u); setTelaAtual('eventos'); }}
        onIrParaCadastro={() => setTelaAtual('cadastro')}
      />
    );
  }

  if (telaAtual === 'main' && eventoSelecionado) {
    return (
      <MainScreen
        usuario={usuarioLogado}
        evento={eventoSelecionado}
        onVoltarEventos={() => { setEventoSelecionado(null); setTelaAtual('eventos'); }}
      />
    );
  }

  return (
    <EventoScreen
      usuario={usuarioLogado}
      onSelecionarEvento={(evento) => {
        setEventoSelecionado(evento);
        setTelaAtual('main');
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
