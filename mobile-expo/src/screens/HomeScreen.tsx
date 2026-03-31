import React, { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.root}>
      <LinearGradient colors={['#f8fafc', '#eef2ff', '#f5f3ff']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{user?.prenom} {user?.nom}</Text>
            <Text style={styles.subtitle}>Role: {user?.role}</Text>
          </View>
          <Pressable style={styles.logout} onPress={() => void logout()}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions rapides</Text>

          <Pressable style={styles.primaryButton} onPress={() => void registerDevice()}>
            <Text style={styles.primaryButtonText}>Enregistrer mon ExpoPushToken</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => void load()}>
            <Text style={styles.secondaryButtonText}>Rafraichir</Text>
          </Pressable>

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Mes devices ({devices.length})</Text>
            {devices.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.deviceName || 'Device sans nom'}</Text>
                <Text style={styles.itemMeta}>{item.platform} - {item.pushToken.slice(0, 26)}...</Text>
              </View>
            ))}
            {!devices.length && <Text style={styles.emptyText}>Aucun device enregistre</Text>}

            {canReadNotifications && (
              <>
                <Text style={styles.sectionTitle}>Notifications ({notifications.length})</Text>
                {notifications.slice(0, 20).map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>{item.type} - {item.status}</Text>
                    <Text style={styles.itemMessage}>{item.message}</Text>
                  </View>
                ))}
                {!notifications.length && <Text style={styles.emptyText}>Aucune notification</Text>}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  logout: {
    backgroundColor: '#111827',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#dc2626',
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
  loaderWrap: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    color: '#0f172a',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderColor: '#dbe3f0',
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  itemTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  itemMeta: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
  },
  itemMessage: {
    color: '#334155',
    fontSize: 12,
    marginTop: 6,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
  },
});
