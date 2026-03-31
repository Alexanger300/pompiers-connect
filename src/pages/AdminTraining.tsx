import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { suiviApi } from '@/lib/api';
import type { FormationItem, Suivi } from '@/types';

const AdminTraining = () => {
  const [items, setItems] = useState<FormationItem[]>([]);
  const [suivis, setSuivis] = useState<Suivi[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [formationItems, mySuivis] = await Promise.all([
          suiviApi.getFormationItems(),
          suiviApi.getMine(),
        ]);

        setItems(formationItems);
        setSuivis(mySuivis);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de chargement');
      }
    };

    void load();
  }, []);

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Suivi formation</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Suivis disponibles</p>
      </motion.div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="space-y-3 mt-5">
        {suivis.map((suivi, i) => {
          const item = items.find((x) => x.id === suivi.itemId);
          const avg = suivi.progressionPourcentage;

          const statusColor =
            avg >= 80
              ? 'bg-green-100 text-green-700'
              : avg >= 50
              ? 'bg-orange-100 text-orange-700'
              : 'bg-red-100 text-red-700';

          const statusLabel =
            avg >= 80 ? 'Excellent' : avg >= 50 ? 'En cours' : 'À renforcer';

          return (
            <motion.div
              key={suivi.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {item?.titre ?? `Formation #${suivi.itemId}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {suivi.commentaires || 'Aucun commentaire'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColor} text-[10px]`}>
                        {statusLabel}
                      </Badge>
                      <span className="text-xl font-display font-bold text-gradient">
                        {avg}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${avg}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full gradient-primary"
                    />
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

export default AdminTraining;