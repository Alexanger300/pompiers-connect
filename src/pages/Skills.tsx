import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-success';
  if (progress >= 50) return 'bg-accent';
  return 'bg-primary';
};

const Skills = () => {
  const categories = [...new Set(MOCK_SKILLS.map(s => s.category))];
  const overall = Math.round(MOCK_SKILLS.reduce((a, b) => a + b.progress, 0) / MOCK_SKILLS.length);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Suivi de compétences</h1>
        <p className="text-muted-foreground mt-1">Votre progression de formation</p>
      </motion.div>

      {/* Overall progress */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-lg">Progression globale</h2>
              <span className="text-3xl font-display font-bold text-gradient">{overall}%</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overall}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* By category */}
      <div className="space-y-6 mt-8">
        {categories.map((cat, ci) => (
          <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + ci * 0.1 }}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-3">{cat}</h3>
            <div className="grid gap-3">
              {MOCK_SKILLS.filter(s => s.category === cat).map(skill => (
                <Card key={skill.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                      <span className="text-sm font-bold text-muted-foreground">{skill.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progress}%` }}
                        transition={{ delay: 0.5 + ci * 0.1, duration: 0.8 }}
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
