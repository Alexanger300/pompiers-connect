import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { suiviApi } from '@/lib/api';
import type { FormationItem, Suivi } from '@/types';

const getProgressColor = (p: number) =>
  p >= 80 ? 'bg-green-500' : p >= 50 ? 'bg-orange-500' : 'bg-red-500';

const Skills = () => {
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

  const rows = useMemo(() => {
    return suivis.map((suivi) => {
      const item = items.find((i) => i.id === suivi.itemId);

      return {
        id: suivi.id,
        category: 'Formation',
        name: item?.titre ?? `Item #${suivi.itemId}`,
        description: item?.description ?? '',
        progress: suivi.progressionPourcentage,
      };
    });
  }, [items, suivis]);

  const overall = rows.length
    ? Math.round(rows.reduce((acc, row) => acc + row.progress, 0) / rows.length)
    : 0;

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Compétences</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Votre progression</p>
      </motion.div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
        <Card className="glass-card mt-5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progression globale</span>
              <span className="text-2xl font-display font-bold text-gradient">{overall}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overall}%` }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-5 mt-6">
        {rows.map((skill, ci) => (
          <motion.div key={skill.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + ci * 0.08 }}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {skill.category}
            </h3>

            <Card className="glass-card">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    {skill.description && (
                      <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{skill.progress}%</span>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ delay: 0.4 + ci * 0.1, duration: 0.6 }}
                    className={`h-full rounded-full ${getProgressColor(skill.progress)}`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Skills;