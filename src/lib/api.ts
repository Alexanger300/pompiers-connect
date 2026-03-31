import type {
  ApiError,
  AppNotification,
  AuthTokens,
  Device,
  Disponibilite,
  FormationItem,
  LoginResponse,
  Suivi,
  SuiviAdminRow,
  User,
  UserRole,
} from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const ENV_PREFIX = (import.meta.env.VITE_API_PREFIX ?? '').trim();
const CANDIDATE_PREFIXES = Array.from(
  new Set([
    ENV_PREFIX,
    '',
    '/api',
  ]
    .map((prefix) => prefix.trim())
    .filter((prefix) => prefix === '' || prefix.startsWith('/'))),
);

let preferredPrefix: string | null = CANDIDATE_PREFIXES[0] ?? '';

const ACCESS_TOKEN_KEY = 'pompiers_access_token';
const REFRESH_TOKEN_KEY = 'pompiers_refresh_token';
const USER_KEY = 'pompiers_user';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

function normalizeUser(input: Partial<User>) : User {
  const rawRole = String(input.role ?? '').toLowerCase();
  const role: UserRole =
    rawRole === 'admin' || rawRole === 'administrateur'
      ? 'admin'
      : rawRole === 'superviseur'
        ? 'superviseur'
        : 'agent';

  return {
    id: Number(input.id),
    nom: String(input.nom ?? ''),
    prenom: String(input.prenom ?? ''),
    email: String(input.email ?? ''),
    telephone: input.telephone ? String(input.telephone) : null,
    role,
    createdAt: input.createdAt ? String(input.createdAt) : undefined,
  };
}

function makeUrl(prefix: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${prefix}${normalizedPath}`;
}

function orderedPrefixes() {
  const prefixes: string[] = [];

  if (preferredPrefix !== null) {
    prefixes.push(preferredPrefix);
  }

  for (const prefix of CANDIDATE_PREFIXES) {
    if (!prefixes.includes(prefix)) {
      prefixes.push(prefix);
    }
  }

  return prefixes;
}

async function fetchWithPrefixFallback(path: string, init?: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;

  for (const prefix of orderedPrefixes()) {
    const response = await fetch(makeUrl(prefix, path), init);

    if (response.status !== 404) {
      preferredPrefix = prefix;
      return response;
    }

    lastResponse = response;
  }

  return lastResponse ?? fetch(makeUrl('', path), init);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiError | null;
    throw new Error(error?.message || 'Erreur API');
  }

  return data as T;
}

async function rawFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithPrefixFallback(path, init);
  return parseResponse<T>(response);
}

async function refreshSession(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await rawFetch<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      },
    );

    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = tokenStorage.getAccessToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetchWithPrefixFallback(path, {
    ...init,
    headers,
  });

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshSession();
    if (newAccessToken) {
      return apiFetch<T>(path, init, false);
    }
  }

  return parseResponse<T>(response);
}

export const authApi = {
  async login(email: string, password: string, deviceName = 'Web Browser') {
    const data = await rawFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceName }),
    });

    const user = normalizeUser(data.user);

    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    // Some backends omit role in /auth/login payload; hydrate from /auth/me when possible.
    try {
      const me = await apiFetch<User>('/auth/me');
      const canonicalUser = normalizeUser({ ...data.user, ...me });
      tokenStorage.setUser(canonicalUser);
      return canonicalUser;
    } catch {
      tokenStorage.setUser(user);
      return user;
    }
  },

  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken) {
      try {
        await rawFetch<void>('/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // always clear local session
      }
    }

    tokenStorage.clear();
  },

  async me() {
    const data = await apiFetch<User>('/auth/me');
    const user = normalizeUser(data);
    tokenStorage.setUser(user);
    return user;
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
    const data = await apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const user = normalizeUser(data.user);

    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    tokenStorage.setUser(user);

    return user;
  },
};

export const usersApi = {
  list() {
    return apiFetch<User[]>('/users');
  },

  getById(id: number) {
    return apiFetch<User>(`/users/${id}`);
  },

  update(
    id: number,
    payload: Partial<Pick<User, 'nom' | 'prenom' | 'email' | 'telephone'>>,
  ) {
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
    return apiFetch<void>(`/users/${id}`, {
      method: 'DELETE',
    });
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
    return apiFetch<void>(`/devices/${id}`, {
      method: 'DELETE',
    });
  },
};

export const notificationsApi = {
  list(filters?: { type?: 'direct' | 'broadcast'; status?: 'pending' | 'sent' | 'failed' }) {
    const params = new URLSearchParams();

    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);

    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<AppNotification[]>(`/notifications${suffix}`);
  },

  sendTargeted(payload: {
    recipientUserIds: number[];
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    return apiFetch<{ message: string; id: number; recipients: number }>('/notifications/targeted', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  sendBroadcast(payload: {
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    return apiFetch<{ message: string; id: number; recipients: number }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
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

  create(payload: {
    dateJour: string;
    tranche: Disponibilite['tranche'];
    statut: Disponibilite['statut'];
  }) {
    return apiFetch<Disponibilite>('/disponibilites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(
    id: number,
    payload: Partial<Pick<Disponibilite, 'dateJour' | 'tranche' | 'statut'>>,
  ) {
    return apiFetch<Disponibilite>(`/disponibilites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  validate(id: number) {
    return apiFetch<Disponibilite>(`/disponibilites/${id}/validate`, {
      method: 'PATCH',
    });
  },

  reject(id: number) {
    return apiFetch<Disponibilite>(`/disponibilites/${id}/reject`, {
      method: 'PATCH',
    });
  },
};

export const suiviApi = {
  getFormationItems() {
    return apiFetch<FormationItem[]>('/suivi/formation-items');
  },

  getFormationItem(id: number) {
    return apiFetch<FormationItem>(`/suivi/formation-items/${id}`);
  },

  getMine() {
    return apiFetch<Suivi[]>('/suivi/');
  },

  getById(id: number) {
    return apiFetch<Suivi>(`/suivi/${id}`);
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

  update(
    id: number,
    payload: Partial<
      Pick<
        Suivi,
        'estValide' | 'progressionPourcentage' | 'commentaires' | 'donneesProgressionJson'
      >
    >,
  ) {
    return apiFetch<Suivi>(`/suivi/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
