import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertTriangle, AlertOctagon, Info, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Notification } from '@/types';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Exercice programmé', message: 'Un exercice incendie est prévu le 15 avril à 9h00.', type: 'info', createdAt: '2026-03-28T10:00:00', read: false },
  { id: '2', title: 'Formation obligatoire', message: 'Rappel: formation PSE2 le 2 avril. Présence obligatoire.', type: 'prioritaire', createdAt: '2026-03-27T14:30:00', read: false },
  { id: '3', title: 'Alerte météo', message: 'Vigilance orange pour vents violents. Restez vigilants.', type: 'urgence', createdAt: '2026-03-26T08:00:00', read: true },
];

const typeConfig = {
  info: { icon: Info, color: 'bg-success text-success-foreground', label: 'Info' },
  prioritaire: { icon: AlertTriangle, color: 'bg-warning text-warning-foreground', label: 'Prioritaire' },
  urgence: { icon: AlertOctagon, color: 'bg-urgent text-urgent-foreground', label: 'Urgence' },
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'info' | 'prioritaire' | 'urgence'>('info');

  const isAdmin = user?.role === 'administrateur';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Gérer et envoyer des notifications' : 'Vos messages et alertes'}
        </p>
      </motion.div>

      {/* Admin: Send notification */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card mt-8">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Envoyer une notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Titre de la notification"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-3">
                <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">ℹ️ Information</SelectItem>
                    <SelectItem value="prioritaire">⚠️ Prioritaire</SelectItem>
                    <SelectItem value="urgence">🚨 Urgence</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gradient-primary text-primary-foreground">
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer à tous
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notifications list */}
      <div className="space-y-3 mt-8">
        {notifications.map((notif, i) => {
          const config = typeConfig[notif.type];
          const Icon = config.icon;
          return (
            <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <Card className={`glass-card ${!notif.read ? 'border-l-4 border-l-primary' : ''}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{notif.title}</h3>
                      <Badge className={config.color} variant="secondary">{config.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
