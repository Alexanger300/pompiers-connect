import type {
  ApiError,
  AuthTokens,
  FormationItem,
  LoginResponse,
  Suivi,
  User,
  UserRole,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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

function normalizeUser(input: Partial<User> & Record<string, unknown>): User {
  return {
    id: Number(input.id),
    nom: String(input.nom ?? ''),
    prenom: String(input.prenom ?? ''),
    email: String(input.email ?? ''),
    telephone: input.telephone ? String(input.telephone) : null,
    role: (input.role as UserRole | undefined) ?? 'agent',
    createdAt: input.createdAt ? String(input.createdAt) : undefined,
  };
}

async function rawFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

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
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshSession();

    if (newAccessToken) {
      return apiFetch<T>(path, init, false);
    }
  }

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
    tokenStorage.setUser(user);

    return user;
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
        // On ignore l'erreur pour toujours vider la session locale
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

  remove(id: number) {
    return apiFetch<void>(`/users/${id}`, {
      method: 'DELETE',
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