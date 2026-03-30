import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Sun, Moon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShiftSelection {
  date: string;
  shift: '7h-19h' | '19h-7h';
}

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selections, setSelections] = useState<ShiftSelection[]>([]);

  const handleShiftSelect = (shift: '7h-19h' | '19h-7h') => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setSelections(prev => {
      const existing = prev.findIndex(s => s.date === dateStr);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { date: dateStr, shift };
        return updated;
      }
      return [...prev, { date: dateStr, shift }];
    });
  };

  const currentSelection = selectedDate ? selections.find(s => s.date === format(selectedDate, 'yyyy-MM-dd')) : undefined;

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Calendrier</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Choisissez vos gardes</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-5">
        <Card className="glass-card">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              className="rounded-md w-full"
              modifiers={{
                booked: selections.map(s => new Date(s.date)),
              }}
              modifiersClassNames={{
                booked: 'bg-primary/20 text-primary font-bold',
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4">
          <p className="text-sm font-medium text-foreground mb-3">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={currentSelection?.shift === '7h-19h' ? 'default' : 'outline'}
              className={`h-20 flex flex-col items-center justify-center gap-1 ${
                currentSelection?.shift === '7h-19h' ? 'gradient-primary text-primary-foreground' : ''
              }`}
              onClick={() => handleShiftSelect('7h-19h')}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs font-semibold">Jour</span>
              <span className="text-[10px] opacity-70">7h - 19h</span>
            </Button>
            <Button
              variant={currentSelection?.shift === '19h-7h' ? 'default' : 'outline'}
              className={`h-20 flex flex-col items-center justify-center gap-1 ${
                currentSelection?.shift === '19h-7h' ? 'gradient-accent text-accent-foreground' : ''
              }`}
              onClick={() => handleShiftSelect('19h-7h')}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs font-semibold">Nuit</span>
              <span className="text-[10px] opacity-70">19h - 7h</span>
            </Button>
          </div>
        </motion.div>
      )}

      {selections.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Vos sélections</p>
          <div className="space-y-2">
            {selections.map(s => (
              <div key={s.date} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm font-medium">{format(new Date(s.date), 'd MMM', { locale: fr })}</span>
                <Badge className={s.shift === '7h-19h' ? 'gradient-primary text-primary-foreground' : 'gradient-accent text-accent-foreground'}>
                  {s.shift === '7h-19h' ? '☀️ Jour' : '🌙 Nuit'}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarPage;
