import { Card, CardContent } from '@/components/ui/card';
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
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Suivi formation</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Progression des stagiaires</p>
      </motion.div>

      <div className="space-y-3 mt-5">
        {TRAINEES.map((trainee, i) => {
          const avg = Math.round(trainee.skills.reduce((a, b) => a + b, 0) / trainee.skills.length);
          const statusColor = avg >= 80 ? 'bg-success/20 text-success' : avg >= 50 ? 'bg-warning/20 text-warning' : 'bg-urgent/20 text-urgent';
          const statusLabel = avg >= 80 ? 'Excellent' : avg >= 50 ? 'En cours' : 'À renforcer';

          return (
            <motion.div key={trainee.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                        {trainee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="font-semibold text-sm text-foreground">{trainee.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColor} text-[10px]`}>{statusLabel}</Badge>
                      <span className="text-xl font-display font-bold text-gradient">{avg}%</span>
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
