import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_RUNTIME } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#09111f', '#101a2b', '#1a0f10']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.blurOrbTop} />
      <View style={styles.blurOrbBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.brandWrap}>
          <Image source={require('../../assets/logo-pompiers-square.png')} style={styles.logo} />
          <Text style={styles.appTitle}>PompierApp</Text>
          <Text style={styles.appSubTitle}>Sapeurs-Pompiers 77 · Centre de secours de Chessy</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardDescription}>Accedez a votre espace operationnel</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.apiHint}>API: {API_RUNTIME.baseUrl}</Text>

          <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  blurOrbTop: {
    position: 'absolute',
    top: -90,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(220, 38, 38, 0.24)',
  },
  blurOrbBottom: {
    position: 'absolute',
    bottom: -90,
    right: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(37, 99, 235, 0.20)',
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: '#fff',
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  appSubTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
  },
  cardDescription: {
    marginTop: 5,
    marginBottom: 14,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 11,
    color: '#111827',
  },
  button: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 6,
    fontSize: 12,
  },
  apiHint: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 8,
  },
});
