import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type {
  AppNotification,
  Device,
  Disponibilite,
  FormationItem,
  NotificationStatus,
  NotificationType,
  Suivi,
  SuiviAdminRow,
  User,
  UserRole,
} from '../types';

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

function normalizeRole(rawRole: unknown): UserRole {
  const role = String(rawRole ?? '').toLowerCase();
  if (role === 'admin' || role === 'administrateur') return 'admin';
  if (role === 'superviseur') return 'superviseur';
  return 'agent';
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
          `Check API reachability from device (HTTPS or correct LAN IP). ` +
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
  if (!response.ok) throw new Error(data?.message || 'Erreur API');
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

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = await storage.getAccessToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetchWithPrefix(path, { ...init, headers });

  if (response.status === 401 && retry) {
    const newToken = await refreshSession();
    if (newToken) return apiFetch<T>(path, init, false);
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

    try {
      const me = await apiFetch<User>('/auth/me');
      const canonicalUser: User = { ...data.user, ...me, role: normalizeRole(me.role ?? data.user.role) };
      await storage.setUser(canonicalUser);
      return canonicalUser;
    } catch {
      const fallbackUser: User = { ...data.user, role: normalizeRole(data.user.role) };
      await storage.setUser(fallbackUser);
      return fallbackUser;
    }
  },

  async register(payload: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    deviceName?: string;
    role?: UserRole;
  }) {
    const data = await apiFetch<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = { ...data.user, role: normalizeRole(data.user.role) } as User;
    return created;
  },

  async me() {
    const user = await apiFetch<User>('/auth/me');
    const normalized = { ...user, role: normalizeRole(user.role) } as User;
    await storage.setUser(normalized);
    return normalized;
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

export const usersApi = {
  list() {
    return apiFetch<User[]>('/users');
  },
  getById(id: number) {
    return apiFetch<User>(`/users/${id}`);
  },
  update(id: number, payload: Partial<Pick<User, 'nom' | 'prenom' | 'email' | 'telephone'>>) {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  updateRole(id: number, role: UserRole) {
    return apiFetch<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
  remove(id: number) {
    return apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
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
    return apiFetch<void>(`/devices/${id}`, { method: 'DELETE' });
  },
};

export const notificationsApi = {
  list(filters?: { type?: NotificationType; status?: NotificationStatus }) {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<AppNotification[]>(`/notifications${suffix}`);
  },
  sendTargeted(payload: { recipientUserIds: number[]; title: string; message: string; data?: Record<string, unknown> }) {
    return apiFetch<{ message: string; id: number; recipients: number }>('/notifications/targeted', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  sendBroadcast(payload: { title: string; message: string; data?: Record<string, unknown> }) {
    return apiFetch<{ message: string; id: number; recipients: number }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  remove(id: number) {
    return apiFetch<void>(`/notifications/${id}`, { method: 'DELETE' });
  },
};

export const disponibilitesApi = {
  list(filters?: { userId?: number; dateJour?: string }) {
    const params = new URLSearchParams();
    if (typeof filters?.userId === 'number') params.set('userId', String(filters.userId));
    if (filters?.dateJour) params.set('dateJour', filters.dateJour);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<Disponibilite[]>(`/disponibilites${suffix}`);
  },
  create(payload: { dateJour: string; tranche: Disponibilite['tranche']; statut: Disponibilite['statut'] }) {
    return apiFetch<Disponibilite>('/disponibilites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(id: number, payload: Partial<Pick<Disponibilite, 'dateJour' | 'tranche' | 'statut'>>) {
    return apiFetch<Disponibilite>(`/disponibilites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  validate(id: number) {
    return apiFetch<Disponibilite>(`/disponibilites/${id}/validate`, { method: 'PATCH' });
  },
  reject(id: number) {
    return apiFetch<Disponibilite>(`/disponibilites/${id}/reject`, { method: 'PATCH' });
  },
};

export const suiviApi = {
  getFormationItems() {
    return apiFetch<FormationItem[]>('/suivi/formation-items');
  },
  getMine() {
    return apiFetch<Suivi[]>('/suivi/');
  },
  getAdmin(filters?: { userId?: number; estValide?: boolean }) {
    const params = new URLSearchParams();
    if (typeof filters?.userId === 'number') params.set('userId', String(filters.userId));
    if (typeof filters?.estValide === 'boolean') params.set('estValide', String(filters.estValide));
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<SuiviAdminRow[]>(`/suivi/admin${suffix}`);
  },
  getPending(filters?: { userId?: number }) {
    const params = new URLSearchParams();
    if (typeof filters?.userId === 'number') params.set('userId', String(filters.userId));
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<SuiviAdminRow[]>(`/suivi/pending${suffix}`);
  },
};
