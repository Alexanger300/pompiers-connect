export type UserRole = 'stagiaire' | 'superviseur' | 'administrateur';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface ScheduleEntry {
  id: string;
  userId: string;
  userName: string;
  date: string;
  shift: '7h-19h' | '19h-7h';
  confirmed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'prioritaire' | 'urgence';
  createdAt: string;
  read: boolean;
}

export interface SkillProgress {
  id: string;
  name: string;
  category: string;
  progress: number;
}
