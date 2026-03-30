import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { user } = useAuth();
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

  const getShiftForDate = (date: Date) => {
    return selections.find(s => s.date === format(date, 'yyyy-MM-dd'));
  };

  const currentSelection = selectedDate ? getShiftForDate(selectedDate) : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Calendrier des gardes</h1>
        <p className="text-muted-foreground mt-1">Sélectionnez vos horaires de garde</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                className="rounded-md"
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

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display">
                {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionnez une date'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate && (
                <>
                  <p className="text-sm text-muted-foreground">Choisissez votre créneau :</p>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant={currentSelection?.shift === '7h-19h' ? 'default' : 'outline'}
                      className={`h-16 flex items-center justify-between px-6 ${
                        currentSelection?.shift === '7h-19h' ? 'gradient-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => handleShiftSelect('7h-19h')}
                    >
                      <div className="flex items-center gap-3">
                        <Sun className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-semibold">Jour</p>
                          <p className="text-xs opacity-80">7h00 - 19h00</p>
                        </div>
                      </div>
                      {currentSelection?.shift === '7h-19h' && <Check className="w-5 h-5" />}
                    </Button>

                    <Button
                      variant={currentSelection?.shift === '19h-7h' ? 'default' : 'outline'}
                      className={`h-16 flex items-center justify-between px-6 ${
                        currentSelection?.shift === '19h-7h' ? 'gradient-accent text-accent-foreground' : ''
                      }`}
                      onClick={() => handleShiftSelect('19h-7h')}
                    >
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-semibold">Nuit</p>
                          <p className="text-xs opacity-80">19h00 - 7h00</p>
                        </div>
                      </div>
                      {currentSelection?.shift === '19h-7h' && <Check className="w-5 h-5" />}
                    </Button>
                  </div>
                </>
              )}

              {/* Recent selections */}
              {selections.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-foreground mb-3">Vos sélections :</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selections.map(s => (
                      <div key={s.date} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">{format(new Date(s.date), 'd MMM yyyy', { locale: fr })}</span>
                        <Badge variant={s.shift === '7h-19h' ? 'default' : 'secondary'} className={s.shift === '7h-19h' ? 'gradient-primary text-primary-foreground' : 'gradient-accent text-accent-foreground'}>
                          {s.shift === '7h-19h' ? '☀️ Jour' : '🌙 Nuit'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;
