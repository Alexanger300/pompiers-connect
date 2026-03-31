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

export interface Device {
  id: number;
  userId: number;
  platform: 'android' | 'ios';
  pushToken: string;
  deviceName?: string | null;
  isActive: boolean;
  lastSeenAt?: string | null;
  createdAt?: string;
}

export type NotificationType = 'direct' | 'broadcast';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface AppNotification {
  id: number;
  type: NotificationType;
  senderUserId: number;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  recipientUserIds: number[];
  recipientCount: number;
  status: NotificationStatus;
  createdAt: string;
}

export type ShiftTranche = '07h-19h' | '19h-07h';
export type DisponibiliteStatut = 'disponible' | 'sollicite' | 'valide' | 'refuse';

export interface Disponibilite {
  id: number;
  userId: number;
  dateJour: string;
  tranche: ShiftTranche;
  statut: DisponibiliteStatut;
  createdAt?: string;
  updatedAt?: string;
  userEmail?: string;
  userNom?: string;
  userPrenom?: string;
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

export interface SuiviAdminRow extends Suivi {
  userEmail?: string;
  userNom?: string;
  userPrenom?: string;
  formationTitre?: string;
}
