import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
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

type Etapa =
  | 'email'
  | 'codigo'
  | 'nova-senha';

export function RecuperacaoSenhaView({
  presenter,
  onVoltarLogin,
}: Props) {

  const [etapa, setEtapa] =
    useState<Etapa>('email');

  const [email, setEmail] =
    useState('');

  const [codigo, setCodigo] =
    useState('');

  const [novaSenha, setNovaSenha] =
    useState('');

  const [confirmarSenha,
    setConfirmarSenha] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  useEffect(() => {
    const view:
      IRecuperacaoSenhaView = {

      showLoading: () => {
        setLoading(true);
        setErro(null);
      },

      hideLoading: () => {
        setLoading(false);
      },

      showError: (msg) => {
        setErro(msg);
      },

      onCodigoGerado:
      (codigoGerado: string) => {
        setErro(null);

        Alert.alert(
          'Código de verificação',
          `Código enviado: ${codigoGerado}`
        );

        setEtapa('codigo');
      },

      onCodigoValidado: () => {
        setErro(null);
        setEtapa('nova-senha');
      },

      onSenhaRedefinida: () => {
        Alert.alert(
          'Sucesso',
          'Senha redefinida com sucesso!'
        );

        onVoltarLogin();
      },
    };

    presenter.attachView(view);

    return () => {
      presenter.detachView();
    };
  }, [presenter, onVoltarLogin]);

  function renderConteudo() {

    if (etapa === 'email') {
      return (
        <>
          <Text style={styles.instrucao}>
            Informe seu e-mail
            cadastrado.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              presenter.handleVerificarEmail(email)
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={styles.buttonText}
              >
                Verificar email
              </Text>
            )}
          </TouchableOpacity>
        </>
      );
    }

    if (etapa === 'codigo') {
      return (
        <>
          <Text style={styles.instrucao}>
            Digite o código
            recebido.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Código"
            value={codigo}
            onChangeText={(text) =>
              setCodigo(
                text
                  .replace(/[^0-9]/g, '')
                  .slice(0, 6)
              )
            }
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              presenter.handleValidarCodigo(
                codigo
              )
            }
          >
            <Text
              style={styles.buttonText}
            >
              Validar código
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <Text style={styles.instrucao}>
          Defina sua nova senha
        </Text>

        <TextInput
          key="nova-senha"
          style={styles.input}
          placeholder="Nova senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
        />

        <TextInput
          key="confirmar-senha"
          style={styles.input}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            presenter.handleRedefinirSenha(
              novaSenha,
              confirmarSenha
            )
          }
        >
          <Text
            style={styles.buttonText}
          >
            Redefinir senha
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.inner}>
        <Text style={styles.title}>
          Debut.io
        </Text>

        <Text style={styles.subtitle}>
          Recuperação de senha
        </Text>

        {erro && (
          <Text style={styles.erro}>
            {erro}
          </Text>
        )}

        {renderConteudo()}

        <TouchableOpacity
          onPress={onVoltarLogin}
        >
          <Text style={styles.link}>
            Voltar para login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9b59b6',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#777',
  },

  instrucao: {
    marginBottom: 12,
    textAlign: 'center',
    color: '#555',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: '#9b59b6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  erro: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },

  link: {
    textAlign: 'center',
    color: '#9b59b6',
    marginTop: 12,
  },
});
