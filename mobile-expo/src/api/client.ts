import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { AppNotification, Device, User } from '../types';

const ACCESS_TOKEN_KEY = 'pompiers_access_token';
const REFRESH_TOKEN_KEY = 'pompiers_refresh_token';
const USER_KEY = 'pompiers_user';

const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const apiPrefixFromConfig = (Constants.expoConfig?.extra?.apiPrefix as string | undefined)?.trim();
const API_BASE_URL = (apiUrlFromConfig || 'http://localhost:4000').replace(/\/$/, '');
const CANDIDATE_PREFIXES = Array.from(
  new Set(
    [apiPrefixFromConfig || '', '', '/api']
      .map((prefix) => prefix.trim())
      .filter((prefix) => prefix === '' || prefix.startsWith('/')),
  ),
);
let preferredPrefix = CANDIDATE_PREFIXES[0] ?? '';

export const API_RUNTIME = {
  baseUrl: API_BASE_URL,
  candidatePrefixes: CANDIDATE_PREFIXES,
};

function makeUrl(prefix: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${prefix}${normalizedPath}`;
}

async function fetchWithPrefix(path: string, init?: RequestInit) {
  const ordered = [preferredPrefix, ...CANDIDATE_PREFIXES.filter((p) => p !== preferredPrefix)];

  let lastResponse: Response | null = null;

  for (const prefix of ordered) {
    let response: Response;
    try {
      response = await fetch(makeUrl(prefix, path), init);
    } catch (error) {
      throw new Error(
        `Network request failed for ${makeUrl(prefix, path)}. ` +
        `Vérifie que l'API est joignable depuis le téléphone (HTTPS ou IP locale correcte). ` +
        `${error instanceof Error ? error.message : ''}`.trim(),
      );
    }

    if (response.status !== 404) {
      preferredPrefix = prefix;
      return response;
    }
    lastResponse = response;
  }

  return lastResponse as Response;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Erreur API');
  }

  return data as T;
}

export const storage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  },
  async setUser(user: User) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
};

async function refreshSession() {
  const refreshToken = await storage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetchWithPrefix('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await parseResponse<{ accessToken: string; refreshToken: string }>(response);
    await storage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    await storage.clear();
    return null;
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = await storage.getAccessToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetchWithPrefix(path, { ...init, headers });

  if (response.status === 401 && retry) {
    const newToken = await refreshSession();
    if (newToken) {
      return apiFetch<T>(path, init, false);
    }
  }

  return parseResponse<T>(response);
}

export const authApi = {
  async login(email: string, password: string, deviceName = 'Expo Go') {
    const response = await fetchWithPrefix('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceName }),
    });

    const data = await parseResponse<{ user: User; accessToken: string; refreshToken: string }>(response);
    await storage.setTokens(data.accessToken, data.refreshToken);

    // /auth/login may omit role in some backends; hydrate from /auth/me if available.
    try {
      const me = await apiFetch<User>('/auth/me');
      const roleRaw = String((me as User).role ?? (data.user as User).role ?? '').toLowerCase();
      const role =
        roleRaw === 'admin' || roleRaw === 'administrateur'
          ? 'admin'
          : roleRaw === 'superviseur'
            ? 'superviseur'
            : 'agent';

      const canonicalUser: User = {
        ...data.user,
        ...me,
        role,
      };

      await storage.setUser(canonicalUser);
      return canonicalUser;
    } catch {
      const roleRaw = String((data.user as User).role ?? '').toLowerCase();
      const role =
        roleRaw === 'admin' || roleRaw === 'administrateur'
          ? 'admin'
          : roleRaw === 'superviseur'
            ? 'superviseur'
            : 'agent';

      const fallbackUser: User = { ...data.user, role };
      await storage.setUser(fallbackUser);
      return fallbackUser;
    }
  },

  async me() {
    const user = await apiFetch<User>('/auth/me');
    await storage.setUser(user);
    return user;
  },

  async logout() {
    const refreshToken = await storage.getRefreshToken();
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore
      }
    }
    await storage.clear();
  },
};

export const devicesApi = {
  list() {
    return apiFetch<Device[]>('/devices');
  },

  upsert(payload: { platform: 'android' | 'ios'; pushToken: string; deviceName?: string }) {
    return apiFetch<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiFetch(`/devices/${id}`, {
      method: 'DELETE',
    });
  },
};

export const notificationsApi = {
  list() {
    return apiFetch<AppNotification[]>('/notifications');
  },
};
