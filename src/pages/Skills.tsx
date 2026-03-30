import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { SkillProgress } from '@/types';

const MOCK_SKILLS: SkillProgress[] = [
  { id: '1', name: 'Secourisme (PSE1)', category: 'Secours', progress: 85 },
  { id: '2', name: 'Secourisme (PSE2)', category: 'Secours', progress: 60 },
  { id: '3', name: 'Incendie urbain', category: 'Incendie', progress: 75 },
  { id: '4', name: 'Feux de forêt', category: 'Incendie', progress: 40 },
  { id: '5', name: 'Conduite VL', category: 'Conduite', progress: 100 },
  { id: '6', name: 'Conduite VSAV', category: 'Conduite', progress: 55 },
  { id: '7', name: 'Opérations diverses', category: 'Opérations', progress: 70 },
  { id: '8', name: 'Communication radio', category: 'Opérations', progress: 90 },
];

const getProgressColor = (p: number) =>
  p >= 80 ? 'bg-success' : p >= 50 ? 'bg-accent' : 'bg-primary';

const Skills = () => {
  const categories = [...new Set(MOCK_SKILLS.map(s => s.category))];
  const overall = Math.round(MOCK_SKILLS.reduce((a, b) => a + b.progress, 0) / MOCK_SKILLS.length);

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Compétences</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Votre progression</p>
      </motion.div>

      {/* Overall */}
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

      {/* Skills by category */}
      <div className="space-y-5 mt-6">
        {categories.map((cat, ci) => (
          <motion.div key={cat} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + ci * 0.08 }}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
            <div className="space-y-2">
              {MOCK_SKILLS.filter(s => s.category === cat).map(skill => (
                <Card key={skill.id} className="glass-card">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
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
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
