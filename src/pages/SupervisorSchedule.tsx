import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ScheduleEntry } from '@/types';

const MOCK_SCHEDULES: ScheduleEntry[] = [
  { id: '1', userId: '1', userName: 'Lucas Martin', date: '2026-04-01', shift: '7h-19h', confirmed: false },
  { id: '2', userId: '4', userName: 'Sophie Bernard', date: '2026-04-01', shift: '19h-7h', confirmed: false },
  { id: '3', userId: '5', userName: 'Thomas Petit', date: '2026-04-02', shift: '7h-19h', confirmed: true },
  { id: '4', userId: '1', userName: 'Lucas Martin', date: '2026-04-03', shift: '19h-7h', confirmed: false },
  { id: '5', userId: '6', userName: 'Emma Leroy', date: '2026-04-03', shift: '7h-19h', confirmed: true },
];

const SupervisorSchedule = () => {
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);

  const handleConfirm = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, confirmed: true } : s));
  };

  const handleReject = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const pending = schedules.filter(s => !s.confirmed);
  const confirmed = schedules.filter(s => s.confirmed);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Gestion des horaires</h1>
        <p className="text-muted-foreground mt-1">Confirmer ou refuser les gardes des stagiaires</p>
      </motion.div>

      {/* Pending */}
      <div className="mt-8">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          En attente ({pending.length})
        </h2>
        <div className="space-y-3">
          {pending.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-l-4 border-l-warning">
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {entry.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{entry.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={entry.shift === '7h-19h' ? 'gradient-primary text-primary-foreground' : 'gradient-accent text-accent-foreground'}>
                      {entry.shift === '7h-19h' ? '☀️ Jour' : '🌙 Nuit'} — {entry.shift}
                    </Badge>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => handleConfirm(entry.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(entry.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {pending.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">Aucune demande en attente ✓</p>
          )}
        </div>
      </div>

      {/* Confirmed */}
      <div className="mt-8">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-success" />
          Confirmés ({confirmed.length})
        </h2>
        <div className="space-y-3">
          {confirmed.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <Card className="glass-card border-l-4 border-l-success opacity-80">
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-sm">
                      {entry.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{entry.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success">
                    ✓ {entry.shift}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupervisorSchedule;
