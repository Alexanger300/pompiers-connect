export type UserRole = 'agent' | 'superviseur' | 'admin';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: UserRole;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface FormationItem {
  id: number;
  titre: string;
  description: string;
  templateJson: Record<string, boolean>;
}

export interface Suivi {
  id: number;
  userId: number;
  itemId: number;
  estValide: boolean;
  progressionPourcentage: number;
  dateValidation: string | null;
  commentaires: string | null;
  donneesProgressionJson: Record<string, boolean>;
}

export interface ApiError {
  message: string;
}