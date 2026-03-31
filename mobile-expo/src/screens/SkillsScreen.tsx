import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { suiviApi } from '../api/client';
import type { FormationItem, Suivi } from '../types';

export function SkillsScreen() {
  const [items, setItems] = useState<FormationItem[]>([]);
  const [suivis, setSuivis] = useState<Suivi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const [formationItems, mySuivis] = await Promise.all([suiviApi.getFormationItems(), suiviApi.getMine()]);
        setItems(formationItems);
        setSuivis(mySuivis);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const rows = useMemo(
    () =>
      suivis.map((s) => {
        const item = items.find((i) => i.id === s.itemId);
        return {
          id: s.id,
          title: item?.titre ?? `Formation #${s.itemId}`,
          description: item?.description ?? '',
          progress: s.progressionPourcentage,
          validated: s.estValide,
        };
      }),
    [suivis, items],
  );

  const average = rows.length ? Math.round(rows.reduce((acc, r) => acc + r.progress, 0) / rows.length) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Progression globale</Text>
        <Text style={styles.summaryValue}>{average}%</Text>
      </View>

      {rows.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.rowTop}>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.progress}>{r.progress}%</Text>
          </View>
          {!!r.description && <Text style={styles.desc}>{r.description}</Text>}
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, r.progress))}%` }]} />
          </View>
          <Text style={[styles.status, r.validated ? styles.valid : styles.pending]}>
            {r.validated ? 'Valide' : 'En cours'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
  error: {
    color: '#b91c1c',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
  },
  summaryLabel: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  progress: {
    color: '#334155',
    fontWeight: '700',
  },
  desc: {
    color: '#64748b',
    fontSize: 12,
  },
  barBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#dc2626',
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
  },
  valid: { color: '#15803d' },
  pending: { color: '#b45309' },
});
