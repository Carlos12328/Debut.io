import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoginScreen } from './modules/login/LoginScreen';
import { Usuario } from '../domain/models';
import { getDatabase } from '../persistence/db';

export default function AppRoot() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [dbPronto, setDbPronto] = useState(false);

  useEffect(() => {
    getDatabase()
      .then(db => {
        const usuarios = db.getAllSync('SELECT * FROM usuario');
        console.log('[DEBUG] Usuários no banco:', JSON.stringify(usuarios));
        setDbPronto(true);
      })
      .catch(err => {
        console.error('[DB ERROR]', err);
        setDbPronto(true); // deixa o app continuar mesmo com erro
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
    return <LoginScreen onLoginSuccess={setUsuarioLogado} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo, {usuarioLogado.nome}! 🎉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, color: '#9b59b6' },
});