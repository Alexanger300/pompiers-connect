import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { disponibilitesApi } from '../api/client';
import type { Disponibilite, DisponibiliteStatut, ShiftTranche } from '../types';

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function DisponibilitesScreen() {
  const [dateJour, setDateJour] = useState(todayYmd());
  const [statut, setStatut] = useState<DisponibiliteStatut>('disponible');
  const [rows, setRows] = useState<Disponibilite[]>([]);
  const [message, setMessage] = useState('');

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
    void load();
  }, []);

  const dayRows = useMemo(() => rows.filter((r) => r.dateJour === dateJour), [rows, dateJour]);

  const saveSlot = async (tranche: ShiftTranche) => {
    setMessage('');
    try {
      const existing = dayRows.find((x) => x.tranche === tranche);
      if (existing) {
        await disponibilitesApi.update(existing.id, { statut });
      } else {
        await disponibilitesApi.create({ dateJour, tranche, statut });
      }
      setMessage('Disponibilite enregistree');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Echec enregistrement');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.title}>Saisir disponibilite</Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={dateJour} onChangeText={setDateJour} placeholder="2026-03-31" />

        <Text style={styles.label}>Statut</Text>
        <View style={styles.chipsRow}>
          {(['disponible', 'sollicite', 'valide', 'refuse'] as const).map((s) => (
            <Pressable key={s} style={[styles.chip, statut === s && styles.chipActive]} onPress={() => setStatut(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primary} onPress={() => void saveSlot('07h-19h')}>
            <Text style={styles.primaryText}>Jour 07h-19h</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => void saveSlot('19h-07h')}>
            <Text style={styles.secondaryText}>Nuit 19h-07h</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Creneaux du jour ({dayRows.length})</Text>
        {dayRows.map((r) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.rowMain}>{r.tranche}</Text>
            <Text style={styles.rowMeta}>{r.statut}</Text>
          </View>
        ))}
        {!dayRows.length && <Text style={styles.empty}>Aucun creneau ce jour.</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Historique ({rows.length})</Text>
        {rows.slice(0, 20).map((r) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.rowMain}>{r.dateJour} - {r.tranche}</Text>
            <Text style={styles.rowMeta}>{r.statut}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  title: { fontWeight: '800', color: '#0f172a' },
  label: { fontSize: 12, color: '#64748b' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  actionsRow: { gap: 8 },
  primary: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  secondary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryText: { color: '#0f172a', fontWeight: '700', fontSize: 12 },
  row: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMain: { color: '#0f172a', fontWeight: '700', fontSize: 12, flex: 1, marginRight: 8 },
  rowMeta: { color: '#475569', fontSize: 12 },
  empty: { color: '#64748b', fontSize: 12 },
});
