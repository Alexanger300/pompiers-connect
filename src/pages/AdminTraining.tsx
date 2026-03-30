import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const TRAINEES = [
  { id: '1', name: 'Lucas Martin', skills: [85, 60, 75, 40, 100, 55, 70, 90] },
  { id: '4', name: 'Sophie Bernard', skills: [90, 70, 60, 30, 80, 45, 65, 85] },
  { id: '5', name: 'Thomas Petit', skills: [50, 40, 55, 20, 70, 30, 45, 60] },
  { id: '6', name: 'Emma Leroy', skills: [95, 85, 90, 75, 100, 80, 88, 92] },
];

const AdminTraining = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Suivi des formations</h1>
        <p className="text-muted-foreground mt-1">Progression de chaque stagiaire</p>
      </motion.div>

      <div className="space-y-4 mt-8">
        {TRAINEES.map((trainee, i) => {
          const avg = Math.round(trainee.skills.reduce((a, b) => a + b, 0) / trainee.skills.length);
          const statusColor = avg >= 80 ? 'bg-success/20 text-success' : avg >= 50 ? 'bg-warning/20 text-warning' : 'bg-urgent/20 text-urgent';
          const statusLabel = avg >= 80 ? 'Excellent' : avg >= 50 ? 'En cours' : 'À renforcer';

          return (
            <motion.div key={trainee.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {trainee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{trainee.name}</p>
                        <p className="text-xs text-muted-foreground">Stagiaire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColor}>{statusLabel}</Badge>
                      <span className="text-2xl font-display font-bold text-gradient">{avg}%</span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
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
