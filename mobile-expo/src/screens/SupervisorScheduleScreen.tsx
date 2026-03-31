import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { disponibilitesApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { Disponibilite } from '../types';

export function SupervisorScheduleScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Disponibilite[]>([]);
  const [message, setMessage] = useState('');

  const forbidden = user?.role !== 'superviseur' && user?.role !== 'admin';

  const load = async () => {
    setMessage('');
    try {
      const data = await disponibilitesApi.list();
      setRows(data);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    if (!forbidden) void load();
  }, [forbidden]);

  const pending = useMemo(
    () => rows.filter((x) => x.statut === 'disponible' || x.statut === 'sollicite'),
    [rows],
  );

  const validated = useMemo(() => rows.filter((x) => x.statut === 'valide'), [rows]);

  const validate = async (id: number) => {
    try {
      await disponibilitesApi.validate(id);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Validation impossible');
    }
  };

  const reject = async (id: number) => {
    try {
      await disponibilitesApi.reject(id);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Refus impossible');
    }
  };

  if (forbidden) {
    return (
      <View style={styles.center}>
        <Text style={styles.forbidden}>Acces reserve admin/superviseur.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.title}>En attente ({pending.length})</Text>
        {pending.map((r) => (
          <View key={r.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowMain}>{r.userPrenom || '-'} {r.userNom || '-'} - {r.dateJour}</Text>
              <Text style={styles.rowMeta}>{r.tranche} / {r.statut}</Text>
            </View>
            <View style={styles.btnsCol}>
              <Pressable style={styles.validBtn} onPress={() => void validate(r.id)}>
                <Text style={styles.validText}>Valider</Text>
              </Pressable>
              <Pressable style={styles.rejectBtn} onPress={() => void reject(r.id)}>
                <Text style={styles.rejectText}>Refuser</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Valide ({validated.length})</Text>
        {validated.slice(0, 25).map((r) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.rowMain}>{r.userPrenom || '-'} {r.userNom || '-'} - {r.dateJour}</Text>
            <Text style={styles.rowMeta}>{r.tranche}</Text>
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
  row: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
  },
  rowMain: { color: '#0f172a', fontWeight: '700', fontSize: 12 },
  rowMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  btnsCol: { gap: 6, width: 84 },
  validBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 7,
  },
  validText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  rejectBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 7,
  },
  rejectText: { color: '#b91c1c', fontWeight: '700', fontSize: 11 },
});
