import React, { useEffect, useMemo, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { devicesApi, notificationsApi, usersApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { AppNotification, Device as AppDevice, NotificationStatus, NotificationType, User } from '../types';

export function NotificationsScreen() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'superviseur';

  const [devices, setDevices] = useState<AppDevice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [sendMode, setSendMode] = useState<'broadcast' | 'targeted'>('broadcast');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipientIds, setRecipientIds] = useState('');

  const [typeFilter, setTypeFilter] = useState<'all' | NotificationType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | NotificationStatus>('all');

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const deviceData = await devicesApi.list();
      setDevices(deviceData);

      if (canManage) {
        const [notifData, userData] = await Promise.all([
          notificationsApi.list(),
          usersApi.list().catch(() => []),
        ]);
        setNotifications(notifData);
        setUsers(userData);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const registerDevice = async () => {
    setMessage('');
    try {
      if (!Device.isDevice) throw new Error('Utilise un appareil reel pour les push');

      const perm = await Notifications.requestPermissionsAsync();
      if (perm.status !== 'granted') throw new Error('Permission notifications refusee');

      const tokenResult = await Notifications.getExpoPushTokenAsync();
      await devicesApi.upsert({
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        pushToken: tokenResult.data,
        deviceName: Device.deviceName || 'Expo Mobile',
      });
      setMessage('Device enregistre');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Impossible d enregistrer le device');
    }
  };

  const removeDevice = async (id: number) => {
    setMessage('');
    try {
      await devicesApi.remove(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Suppression impossible');
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setMessage('Titre et message obligatoires');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      if (sendMode === 'broadcast') {
        const result = await notificationsApi.sendBroadcast({ title, message: body });
        setMessage(`${result.message} (${result.recipients})`);
      } else {
        const ids = recipientIds
          .split(',')
          .map((x) => Number(x.trim()))
          .filter((x) => Number.isInteger(x) && x > 0);
        if (!ids.length) throw new Error('Ajoute au moins un ID destinataire');
        const result = await notificationsApi.sendTargeted({
          title,
          message: body,
          recipientUserIds: ids,
        });
        setMessage(`${result.message} (${result.recipients})`);
      }

      setTitle('');
      setBody('');
      setRecipientIds('');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Envoi impossible');
    } finally {
      setSaving(false);
    }
  };

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        const okType = typeFilter === 'all' || n.type === typeFilter;
        const okStatus = statusFilter === 'all' || n.status === statusFilter;
        return okType && okStatus;
      }),
    [notifications, typeFilter, statusFilter],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.title}>Mes devices ({devices.length})</Text>
        <Pressable style={styles.primaryBtn} onPress={() => void registerDevice()}>
          <Text style={styles.primaryText}>Enregistrer ExpoPushToken</Text>
        </Pressable>

        {devices.map((d) => (
          <View key={d.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{d.deviceName || 'Device'}</Text>
              <Text style={styles.itemMeta}>{d.platform} - {d.pushToken.slice(0, 20)}...</Text>
            </View>
            <Pressable style={styles.smallDanger} onPress={() => void removeDevice(d.id)}>
              <Text style={styles.smallDangerText}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {canManage && (
        <>
          <View style={styles.card}>
            <Text style={styles.title}>Envoyer notification</Text>

            <View style={styles.chipsRow}>
              <Pressable
                style={[styles.chip, sendMode === 'broadcast' && styles.chipActive]}
                onPress={() => setSendMode('broadcast')}
              >
                <Text style={styles.chipText}>Broadcast</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, sendMode === 'targeted' && styles.chipActive]}
                onPress={() => setSendMode('targeted')}
              >
                <Text style={styles.chipText}>Targeted</Text>
              </Pressable>
            </View>

            {sendMode === 'targeted' ? (
              <TextInput
                style={styles.input}
                placeholder="IDs ex: 2,3,4"
                value={recipientIds}
                onChangeText={setRecipientIds}
              />
            ) : null}

            <TextInput style={styles.input} placeholder="Titre" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Message" value={body} onChangeText={setBody} multiline />

            {!!users.length && (
              <Text style={styles.help}>
                IDs: {users.slice(0, 20).map((u) => `${u.id}:${u.prenom}`).join(' | ')}
              </Text>
            )}

            <Pressable style={styles.primaryBtn} onPress={() => void sendNotification()} disabled={saving}>
              <Text style={styles.primaryText}>{saving ? 'Envoi...' : 'Envoyer'}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Historique</Text>
            <View style={styles.chipsRow}>
              {(['all', 'broadcast', 'direct'] as const).map((type) => (
                <Pressable key={type} style={[styles.chip, typeFilter === type && styles.chipActive]} onPress={() => setTypeFilter(type)}>
                  <Text style={styles.chipText}>{type}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.chipsRow}>
              {(['all', 'pending', 'sent', 'failed'] as const).map((status) => (
                <Pressable key={status} style={[styles.chip, statusFilter === status && styles.chipActive]} onPress={() => setStatusFilter(status)}>
                  <Text style={styles.chipText}>{status}</Text>
                </Pressable>
              ))}
            </View>

            {loading ? <ActivityIndicator /> : null}
            {filteredNotifications.map((n) => (
              <View key={n.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemMeta}>{n.type} - {n.status}</Text>
                  <Text style={styles.itemMeta}>{n.message}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  title: {
    fontWeight: '800',
    color: '#0f172a',
  },
  message: {
    color: '#0f766e',
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
  },
  itemTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  itemMeta: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  smallDanger: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  smallDangerText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  help: {
    fontSize: 11,
    color: '#64748b',
  },
});
