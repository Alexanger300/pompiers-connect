import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { usersApi } from '../api/client';
import type { User } from '../types';

export function ProfileScreen() {
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [message, setMessage] = useState('');

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const load = async () => {
    if (!user) return;
    setMessage('');
    try {
      const data = await usersApi.getById(user.id);
      setProfile(data);
      setNom(data.nom || '');
      setPrenom(data.prenom || '');
      setEmail(data.email || '');
      setTelephone(data.telephone || '');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const save = async () => {
    if (!user) return;
    setMessage('');
    try {
      const updated = await usersApi.update(user.id, {
        nom,
        prenom,
        email,
        telephone: telephone || undefined,
      });
      setProfile(updated);
      await refreshMe();
      setMessage('Profil mis a jour');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Mise a jour impossible');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.headerCard}>
        <Text style={styles.name}>{profile?.prenom} {profile?.nom}</Text>
        <Text style={styles.meta}>{profile?.email}</Text>
        <Text style={styles.role}>Role: {profile?.role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Prenom</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />
        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Text style={styles.label}>Telephone</Text>
        <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} />

        <Pressable style={styles.primaryBtn} onPress={() => void save()}>
          <Text style={styles.primaryText}>Sauvegarder</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  message: { color: '#0f766e', fontSize: 12 },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
  },
  name: { color: '#fff', fontWeight: '800', fontSize: 20 },
  meta: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  role: { color: '#93c5fd', fontSize: 12, marginTop: 6, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  label: { color: '#64748b', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
