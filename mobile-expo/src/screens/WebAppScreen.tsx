import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const AUTH_SYNC_INJECTED_JS = `
(function () {
  try {
    var ACCESS = 'pompiers_access_token';
    var REFRESH = 'pompiers_refresh_token';
    var USER = 'pompiers_user';

    function emitAuth() {
      var payload = {
        type: 'authState',
        accessToken: localStorage.getItem(ACCESS),
        refreshToken: localStorage.getItem(REFRESH),
        user: localStorage.getItem(USER),
      };
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }

    var lastAccess = localStorage.getItem(ACCESS) || '';
    emitAuth();

    setInterval(function () {
      var current = localStorage.getItem(ACCESS) || '';
      if (current !== lastAccess) {
        lastAccess = current;
        emitAuth();
      }
    }, 1000);

    var oldSetItem = localStorage.setItem;
    localStorage.setItem = function (k, v) {
      oldSetItem.apply(this, arguments);
      if (k === ACCESS || k === REFRESH || k === USER) emitAuth();
    };

    var oldRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function (k) {
      oldRemoveItem.apply(this, arguments);
      if (k === ACCESS || k === REFRESH || k === USER) emitAuth();
    };

    var oldClear = localStorage.clear;
    localStorage.clear = function () {
      oldClear.apply(this, arguments);
      emitAuth();
    };
  } catch (_) {}
  true;
})();
`;

type AuthStateMessage = {
  type: 'authState';
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: string | null;
};

export function WebAppScreen() {
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [lastError, setLastError] = useState('');

  const lastRegisteredKeyRef = useRef('');

  const webUrl = useMemo(() => {
    const fromConfig = Constants.expoConfig?.extra?.webAppUrl as string | undefined;
    return (fromConfig || 'https://pompiers-connect.vercel.app').trim();
  }, []);

  const apiBaseUrl = useMemo(() => {
    const fromConfig = Constants.expoConfig?.extra?.apiUrl as string | undefined;
    return (fromConfig || 'https://pompiers-connect.vercel.app').trim().replace(/\/$/, '');
  }, []);

  const apiPrefixCandidates = useMemo(() => {
    const fromConfig = (Constants.expoConfig?.extra?.apiPrefix as string | undefined)?.trim() || '';
    return Array.from(new Set([fromConfig, '', '/api'].filter((x) => x === '' || x.startsWith('/'))));
  }, []);

  const upsertDevice = async (accessToken: string, pushToken: string) => {
    let lastResponse: Response | null = null;

    for (const prefix of apiPrefixCandidates) {
      const url = `${apiBaseUrl}${prefix}/devices`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          pushToken,
          deviceName: Device.deviceName || 'Expo Mobile',
        }),
      });

      if (response.status !== 404) {
        if (!response.ok) {
          const maybeError = await response.json().catch(() => null);
          throw new Error(maybeError?.message || `POST /devices failed (${response.status})`);
        }
        return;
      }

      lastResponse = response;
    }

    throw new Error(`POST /devices not found (last status: ${lastResponse?.status ?? 'n/a'})`);
  };

  const registerPushAfterLogin = async (accessToken: string) => {
    if (!Device.isDevice) return;

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') return;

    const tokenResult = await Notifications.getExpoPushTokenAsync();
    const key = `${accessToken.slice(0, 24)}:${tokenResult.data}`;

    if (lastRegisteredKeyRef.current === key) {
      return;
    }

    await upsertDevice(accessToken, tokenResult.data);
    lastRegisteredKeyRef.current = key;
  };

  const onWebMessage = async (event: WebViewMessageEvent) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data) as AuthStateMessage;
      if (parsed.type !== 'authState') return;

      if (!parsed.accessToken) {
        lastRegisteredKeyRef.current = '';
        return;
      }

      await registerPushAfterLogin(parsed.accessToken);
    } catch {
      // ignore malformed webview bridge messages
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Pompiers Connect</Text>
        <Pressable style={styles.reloadBtn} onPress={() => setReloadKey((k) => k + 1)}>
          <Text style={styles.reloadText}>Rafraichir</Text>
        </Pressable>
      </View>

      {!!lastError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{lastError}</Text>
        </View>
      )}

      <WebView
        key={reloadKey}
        source={{ uri: webUrl }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        injectedJavaScriptBeforeContentLoaded={AUTH_SYNC_INJECTED_JS}
        onMessage={(event) => {
          void onWebMessage(event);
        }}
        onLoadStart={() => {
          setLoading(true);
          setLastError('');
        }}
        onLoadEnd={() => setLoading(false)}
        onError={(event) => {
          setLoading(false);
          setLastError(`Erreur de chargement WebView: ${event.nativeEvent.description}`);
        }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Chargement de l'application...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  reloadBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  reloadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
});
