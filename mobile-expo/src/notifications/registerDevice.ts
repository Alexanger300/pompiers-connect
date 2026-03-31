import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { devicesApi } from '../api/client';

export async function registerPushDeviceSilently() {
  if (!Device.isDevice) return;

  const permission = await Notifications.getPermissionsAsync();
  let status = permission.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') return;

  const tokenResult = await Notifications.getExpoPushTokenAsync();
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  await devicesApi.upsert({
    platform,
    pushToken: tokenResult.data,
    deviceName: Device.deviceName || 'Expo Mobile',
  });
}
