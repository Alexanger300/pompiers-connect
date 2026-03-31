import React, { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { devicesApi, notificationsApi } from '../api/client';
import type { AppNotification, Device as UserDevice } from '../types';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const canReadNotifications = user?.role === 'admin' || user?.role === 'superviseur';

  const load = async () => {
    setLoading(true);
    setMessage('');

    try {
      const devicesData = await devicesApi.list();
      setDevices(devicesData);

      if (canReadNotifications) {
        const notifData = await notificationsApi.list();
        setNotifications(notifData);
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
      if (!Device.isDevice) {
        throw new Error('Utilise un appareil reel pour tester le push');
      }

      const permission = await Notifications.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Permission notifications refusee');
      }

      const tokenResult = await Notifications.getExpoPushTokenAsync();
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      await devicesApi.upsert({
        platform,
        pushToken: tokenResult.data,
        deviceName: Device.deviceName || 'Expo Go',
      });

      setMessage('Device enregistre sur /devices');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Echec enregistrement device');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{user?.prenom} {user?.nom}</Text>
          <Text style={styles.subtitle}>Role: {user?.role}</Text>
        </View>
        <Pressable style={styles.logout} onPress={() => void logout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => void registerDevice()}>
        <Text style={styles.primaryButtonText}>Enregistrer mon ExpoPushToken</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => void load()}>
        <Text style={styles.secondaryButtonText}>Rafraichir</Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {loading ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Mes devices ({devices.length})</Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => String(item.id)}
            style={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.deviceName || 'Device sans nom'}</Text>
                <Text style={styles.cardMeta}>{item.platform} - {item.pushToken.slice(0, 26)}...</Text>
              </View>
            )}
          />

          {canReadNotifications && (
            <>
              <Text style={styles.sectionTitle}>Notifications ({notifications.length})</Text>
              <FlatList
                data={notifications.slice(0, 20)}
                keyExtractor={(item) => String(item.id)}
                style={styles.list}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMeta}>{item.type} - {item.status}</Text>
                    <Text style={styles.cardMessage}>{item.message}</Text>
                  </View>
                )}
              />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
  },
  logout: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#c21807',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3f0',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
    marginTop: 8,
    color: '#0f766e',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#0f172a',
  },
  list: {
    maxHeight: 180,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#dbe3f0',
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  cardMeta: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
  },
  cardMessage: {
    color: '#334155',
    fontSize: 12,
    marginTop: 6,
  },
});
