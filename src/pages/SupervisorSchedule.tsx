import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Horaires</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Confirmer les gardes</p>
      </motion.div>

      {/* Pending */}
      <div className="mt-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-warning" /> En attente ({pending.length})
        </h2>
        <div className="space-y-2">
          {pending.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-card border-l-4 border-l-warning">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                        {entry.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{entry.userName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${entry.shift === '7h-19h' ? 'gradient-primary text-primary-foreground' : 'gradient-accent text-accent-foreground'}`}>
                        {entry.shift === '7h-19h' ? '☀️' : '🌙'} {entry.shift}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-success text-success-foreground hover:bg-success/90 h-8 text-xs" onClick={() => handleConfirm(entry.id)}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Confirmer
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs" onClick={() => handleReject(entry.id)}>
                      <X className="w-3.5 h-3.5 mr-1" /> Refuser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {pending.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">Aucune demande en attente ✓</p>
          )}
        </div>
      </div>

      {/* Confirmed */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-success" /> Confirmés ({confirmed.length})
        </h2>
        <div className="space-y-2">
          {confirmed.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>
              <Card className="glass-card border-l-4 border-l-success opacity-80">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-xs">
                      {entry.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{entry.userName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success text-[10px]">✓ {entry.shift}</Badge>
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
