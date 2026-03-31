import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { suiviApi } from '@/lib/api';
import type { SuiviAdminRow } from '@/types';

const AdminTraining = () => {
  const [suivis, setSuivis] = useState<SuiviAdminRow[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');

    try {
      const rows = showPendingOnly ? await suiviApi.getPending() : await suiviApi.getAdmin();
      setSuivis(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    void load();
  }, [showPendingOnly]);

  const average = useMemo(() => {
    if (!suivis.length) return 0;
    return Math.round(suivis.reduce((acc, s) => acc + s.progressionPourcentage, 0) / suivis.length);
  }, [suivis]);

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Suivi formation</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Vue management</p>
        </div>
        <button
          className="text-xs px-3 py-2 rounded-lg border"
          onClick={() => setShowPendingOnly((prev) => !prev)}
        >
          {showPendingOnly ? 'Voir tout' : 'Voir pending'}
        </button>
      </motion.div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <Card className="glass-card mt-5">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Suivis</p>
            <p className="text-xl font-bold">{suivis.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Moyenne progression</p>
            <p className="text-xl font-bold">{average}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 mt-5">
        {suivis.map((suivi, i) => (
          <motion.div
            key={suivi.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {suivi.userPrenom || '-'} {suivi.userNom || '-'} - {suivi.formationTitre || `Item #${suivi.itemId}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{suivi.userEmail || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={suivi.estValide ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {suivi.estValide ? 'Valide' : 'A valider'}
                    </Badge>
                    <span className="font-bold">{suivi.progressionPourcentage}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{suivi.commentaires || 'Aucun commentaire'}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {!suivis.length && <p className="text-sm text-muted-foreground">Aucun suivi trouve.</p>}
      </div>
    </div>
  );
};

export default AdminTraining;
