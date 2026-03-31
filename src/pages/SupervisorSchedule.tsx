import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { disponibilitesApi } from '@/lib/api';
import type { Disponibilite } from '@/types';

const SupervisorSchedule = () => {
  const [entries, setEntries] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await disponibilitesApi.list();
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pending = useMemo(
    () => entries.filter((x) => x.statut === 'disponible' || x.statut === 'sollicite'),
    [entries],
  );

  const validated = useMemo(
    () => entries.filter((x) => x.statut === 'valide'),
    [entries],
  );

  const handleValidate = async (id: number) => {
    setError('');
    try {
      await disponibilitesApi.validate(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Validation impossible');
    }
  };

  const handleReject = async (id: number) => {
    setError('');
    try {
      await disponibilitesApi.reject(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refus impossible');
    }
  };

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Horaires</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Confirmer les gardes</p>
      </motion.div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
        </div>
      ) : (
        <>
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
                        <div>
                          <p className="font-semibold text-sm text-foreground">{entry.userPrenom || '-'} {entry.userNom || '-'}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.dateJour} - {entry.tranche}</p>
                        </div>
                        <Badge className="text-[10px]">{entry.statut}</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-success text-success-foreground hover:bg-success/90 h-8 text-xs" onClick={() => void handleValidate(entry.id)}>
                          <Check className="w-3.5 h-3.5 mr-1" /> Valider
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs" onClick={() => void handleReject(entry.id)}>
                          <X className="w-3.5 h-3.5 mr-1" /> Refuser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {pending.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">Aucune demande en attente.</p>}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success" /> Confirmes ({validated.length})
            </h2>
            <div className="space-y-2">
              {validated.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>
                  <Card className="glass-card border-l-4 border-l-success opacity-80">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{entry.userPrenom || '-'} {entry.userNom || '-'}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.dateJour} - {entry.tranche}</p>
                      </div>
                      <Badge className="bg-success/20 text-success text-[10px]">Valide</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupervisorSchedule;
