import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { authApi, usersApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { User, UserRole } from '../types';

export function AdminUsersScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('agent');

  const forbidden = user?.role !== 'admin';

  const load = async () => {
    setMessage('');
    try {
      const data = await usersApi.list();
      setRows(data);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    if (!forbidden) void load();
  }, [forbidden]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)),
    [rows],
  );

  const createUser = async () => {
    setMessage('');
    if (!email || !password || !nom || !prenom) {
      setMessage('Nom, prenom, email et mot de passe obligatoires');
      return;
    }

    setSaving(true);
    try {
      await authApi.register({ email, password, nom, prenom, telephone: telephone || undefined, role, deviceName: 'Admin Mobile' });
      setNom('');
      setPrenom('');
      setEmail('');
      setTelephone('');
      setPassword('');
      setRole('agent');
      setMessage('Utilisateur cree');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Creation impossible');
    } finally {
      setSaving(false);
    }
  };

  const cycleRole = async (target: User) => {
    setMessage('');
    const nextRole: UserRole = target.role === 'agent' ? 'superviseur' : target.role === 'superviseur' ? 'admin' : 'agent';
    try {
      await usersApi.updateRole(target.id, nextRole);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Changement role impossible');
    }
  };

  const removeUser = async (id: number) => {
    setMessage('');
    try {
      await usersApi.remove(id);
      setRows((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Suppression impossible');
    }
  };

  if (forbidden) {
    return (
      <View style={styles.center}>
        <Text style={styles.forbidden}>Acces reserve admin.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.title}>Ajouter utilisateur</Text>
        <TextInput style={styles.input} placeholder="Prenom" value={prenom} onChangeText={setPrenom} />
        <TextInput style={styles.input} placeholder="Nom" value={nom} onChangeText={setNom} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Telephone" value={telephone} onChangeText={setTelephone} />
        <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

        <View style={styles.chipsRow}>
          {(['agent', 'superviseur', 'admin'] as const).map((r) => (
            <Pressable key={r} style={[styles.chip, role === r && styles.chipActive]} onPress={() => setRole(r)}>
              <Text style={styles.chipText}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.primaryBtn} onPress={() => void createUser()} disabled={saving}>
          <Text style={styles.primaryText}>{saving ? 'Creation...' : 'Creer'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Utilisateurs ({sorted.length})</Text>
        {sorted.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.prenom} {u.nom}</Text>
              <Text style={styles.userMeta}>{u.email}</Text>
              <Text style={styles.userMeta}>role: {u.role}</Text>
            </View>
            <View style={styles.userActions}>
              <Pressable style={styles.roleBtn} onPress={() => void cycleRole(u)}>
                <Text style={styles.roleBtnText}>Role+</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => void removeUser(u.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  forbidden: { color: '#991b1b', fontWeight: '700' },
  container: { padding: 16, gap: 12 },
  message: { color: '#0f766e', fontSize: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  title: { color: '#0f172a', fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  chipText: { color: '#0f172a', fontSize: 11, fontWeight: '700' },
  primaryBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  userRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
  },
  userName: { color: '#0f172a', fontWeight: '700', fontSize: 13 },
  userMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  userActions: { gap: 6, width: 74 },
  roleBtn: {
    backgroundColor: '#111827',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 7,
  },
  roleBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 7,
  },
  deleteBtnText: { color: '#b91c1c', fontWeight: '700', fontSize: 11 },
});
