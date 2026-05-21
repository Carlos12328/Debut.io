import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
    if (Platform.OS === 'web') {
      setDbPronto(true);
      return;
    }
    getDatabase()
      .then(() => setDbPronto(true))
      .catch(err => {
        console.error('[DB ERROR]', err);
        setDbPronto(true);
      });
  }, []);

  // Tela de aviso para usuários web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webCard}>
          <Text style={styles.webLogo}>Debut.io</Text>
          <Text style={styles.webTitulo}>App disponivel apenas no celular</Text>
          <Text style={styles.webTexto}>
            O Debut.io e um aplicativo mobile e nao funciona no navegador web.
          </Text>
          <Text style={styles.webTexto}>
            Para usar, instale o app <Text style={styles.webDestaque}>Expo Go</Text> no
            seu celular e escaneie o QR code exibido no terminal.
          </Text>
          <View style={styles.webPassos}>
            <Text style={styles.webPasso}>1. Baixe o Expo Go na Play Store ou App Store</Text>
            <Text style={styles.webPasso}>2. Abra o Expo Go no celular</Text>
            <Text style={styles.webPasso}>3. Escaneie o QR code do terminal</Text>
            <Text style={styles.webPasso}>4. O app abrira automaticamente</Text>
          </View>
        </View>
      </View>
    );
  }

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
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
    minHeight: '100vh' as any,
  },
  webCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 480,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  webLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9b59b6',
    textAlign: 'center',
    marginBottom: 16,
  },
  webTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  webTexto: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  webDestaque: {
    color: '#9b59b6',
    fontWeight: '600',
  },
  webPassos: {
    backgroundColor: '#f9f4fc',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  webPasso: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});