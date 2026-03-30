import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, AlertOctagon, Info, Send, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);
  const isAdmin = user?.role === 'administrateur';

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {isAdmin ? 'Gérer les alertes' : 'Vos alertes'}
        </p>
      </motion.div>

      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-5">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Envoyer une notification</span>
            {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          {showForm && (
            <Card className="glass-card mt-3">
              <CardContent className="p-4 space-y-3">
                <Input placeholder="Titre" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <Textarea placeholder="Message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={2} />
                <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">ℹ️ Info</SelectItem>
                    <SelectItem value="prioritaire">⚠️ Prioritaire</SelectItem>
                    <SelectItem value="urgence">🚨 Urgence</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full gradient-primary text-primary-foreground">
                  <Send className="w-4 h-4 mr-2" /> Envoyer
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      <div className="space-y-3 mt-5">
        {notifications.map((notif, i) => {
          const config = typeConfig[notif.type];
          const Icon = config.icon;
          return (
            <motion.div key={notif.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <Card className={`glass-card ${!notif.read ? 'border-l-4 border-l-primary' : ''}`}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">{notif.title}</h3>
                      <Badge className={`${config.color} text-[10px] px-1.5 py-0`}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
