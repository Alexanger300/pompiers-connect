import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { disponibilitesApi } from '@/lib/api';
import type { Disponibilite, DisponibiliteStatut, ShiftTranche } from '@/types';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<Disponibilite[]>([]);
  const [statut, setStatut] = useState<DisponibiliteStatut>('disponible');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setError('');
    try {
      const data = await disponibilitesApi.list();
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const selectionsByDate = useMemo(() => {
    const map = new Map<string, Disponibilite[]>();

    for (const entry of entries) {
      const existing = map.get(entry.dateJour) ?? [];
      existing.push(entry);
      map.set(entry.dateJour, existing);
    }

    return map;
  }, [entries]);

  const currentSelections = dateKey ? selectionsByDate.get(dateKey) ?? [] : [];

  const saveShift = async (tranche: ShiftTranche) => {
    if (!dateKey) return;

    setError('');
    setSuccess('');

    try {
      const existing = currentSelections.find((x) => x.tranche === tranche);

      if (existing) {
        await disponibilitesApi.update(existing.id, { statut });
      } else {
        await disponibilitesApi.create({
          dateJour: dateKey,
          tranche,
          statut,
        });
      }

      setSuccess('Disponibilite enregistree');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    }
  };

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Calendrier</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Choisissez vos disponibilites</p>
      </motion.div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-600">{success}</p>}

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
                booked: Array.from(selectionsByDate.keys()).map((day) => new Date(day)),
              }}
              modifiersClassNames={{
                booked: 'bg-primary/20 text-primary font-bold',
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </p>

          <Select value={statut} onValueChange={(v: DisponibiliteStatut) => setStatut(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="sollicite">Sollicite</SelectItem>
              <SelectItem value="valide">Valide</SelectItem>
              <SelectItem value="refuse">Refuse</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Button className="h-20 flex flex-col gap-1 gradient-primary text-primary-foreground" onClick={() => void saveShift('07h-19h')}>
              <Sun className="w-6 h-6" />
              <span className="text-xs font-semibold">Jour</span>
              <span className="text-[10px] opacity-70">07h - 19h</span>
            </Button>
            <Button className="h-20 flex flex-col gap-1 gradient-accent text-accent-foreground" onClick={() => void saveShift('19h-07h')}>
              <Moon className="w-6 h-6" />
              <span className="text-xs font-semibold">Nuit</span>
              <span className="text-[10px] opacity-70">19h - 07h</span>
            </Button>
          </div>
        </motion.div>
      )}

      {currentSelections.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Creneaux du jour</p>
          <div className="space-y-2">
            {currentSelections.map((selection) => (
              <div key={selection.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm font-medium">{selection.tranche}</span>
                <Badge>{selection.statut}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarPage;
