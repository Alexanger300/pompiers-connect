import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { suiviApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { SuiviAdminRow } from '../types';

export function AdminTrainingScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SuiviAdminRow[]>([]);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [message, setMessage] = useState('');

  const forbidden = user?.role !== 'admin' && user?.role !== 'superviseur';

  const load = async () => {
    setMessage('');
    try {
      const data = pendingOnly ? await suiviApi.getPending() : await suiviApi.getAdmin();
      setRows(data);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    if (!forbidden) void load();
  }, [forbidden, pendingOnly]);

  const average = useMemo(() => {
    if (!rows.length) return 0;
    return Math.round(rows.reduce((acc, x) => acc + x.progressionPourcentage, 0) / rows.length);
  }, [rows]);

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

      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerLabel}>Suivis</Text>
          <Text style={styles.headerValue}>{rows.length}</Text>
        </View>
        <View>
          <Text style={styles.headerLabel}>Moyenne</Text>
          <Text style={styles.headerValue}>{average}%</Text>
        </View>
      </View>

      <Pressable style={styles.toggleBtn} onPress={() => setPendingOnly((prev) => !prev)}>
        <Text style={styles.toggleText}>{pendingOnly ? 'Voir tous les suivis' : 'Voir seulement pending'}</Text>
      </Pressable>

      {rows.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.title}>{r.userPrenom || '-'} {r.userNom || '-'} - {r.formationTitre || `Item #${r.itemId}`}</Text>
          <Text style={styles.meta}>{r.userEmail || ''}</Text>
          <Text style={styles.meta}>Progression: {r.progressionPourcentage}%</Text>
          <Text style={[styles.badge, r.estValide ? styles.ok : styles.pending]}>{r.estValide ? 'Valide' : 'A valider'}</Text>
          <Text style={styles.comment}>{r.commentaires || 'Aucun commentaire'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  forbidden: { color: '#991b1b', fontWeight: '700' },
  container: { padding: 16, gap: 10 },
  message: { color: '#0f766e', fontSize: 12 },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLabel: { color: '#cbd5e1', fontSize: 12 },
  headerValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  toggleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleText: { color: '#0f172a', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 4,
  },
  title: { color: '#0f172a', fontWeight: '800', fontSize: 13 },
  meta: { color: '#64748b', fontSize: 11 },
  badge: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  ok: { color: '#15803d' },
  pending: { color: '#b45309' },
  comment: { color: '#334155', fontSize: 12, marginTop: 4 },
});
