export type UserRole = 'agent' | 'superviseur' | 'admin';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: UserRole;
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

export interface AppNotification {
  id: number;
  type: 'direct' | 'broadcast';
  senderUserId: number;
  title: string;
  message: string;
  recipientCount: number;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}
