import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, BookOpen, Bell, Users, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardCard = ({
  title,
  description,
  icon: Icon,
  to,
  color,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  color: string;
  delay: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Link to={to}>
      <Card className="glass-card hover:shadow-xl transition-all duration-300 active:scale-[0.98] cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground">{title}</h3>
            <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  const agentCards = [
    { title: 'Calendrier', description: 'Gerer vos disponibilites', icon: Calendar, to: '/calendrier', color: 'gradient-primary' },
    { title: 'Competences', description: 'Suivi de formation personnel', icon: BookOpen, to: '/competences', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Gerer vos appareils push', icon: Bell, to: '/notifications', color: 'bg-success' },
  ];

  const superviseurCards = [
    { title: 'Calendrier', description: 'Voir les disponibilites', icon: Calendar, to: '/calendrier', color: 'gradient-primary' },
    { title: 'Horaires', description: 'Valider ou refuser les creneaux', icon: CheckCircle, to: '/superviseur', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Envoyer des alertes', icon: Bell, to: '/notifications', color: 'bg-success' },
    { title: 'Suivi formation', description: 'Vue globale des agents', icon: BookOpen, to: '/admin/suivi', color: 'bg-urgent' },
  ];

  const adminCards = [
    { title: 'Utilisateurs', description: 'Gerer les comptes et roles', icon: Users, to: '/admin/utilisateurs', color: 'gradient-primary' },
    { title: 'Suivi formation', description: 'Progression de tous les agents', icon: BookOpen, to: '/admin/suivi', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Historique et envoi push', icon: Bell, to: '/notifications', color: 'bg-urgent' },
    { title: 'Calendrier', description: 'Vue globale des disponibilites', icon: Calendar, to: '/calendrier', color: 'bg-success' },
  ];

  const cards = user.role === 'admin' ? adminCards : user.role === 'superviseur' ? superviseurCards : agentCards;

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground text-sm">Bonjour</p>
        <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
          <span className="text-gradient">{user.prenom} {user.nom}</span>
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {[
          { label: 'Role', value: user.role, icon: Users },
          { label: 'Acces', value: 'Actif', icon: CheckCircle },
          { label: 'Notifications', value: 'Push', icon: Bell },
          { label: 'Planning', value: 'Disponible', icon: Clock },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-card">
              <CardContent className="p-3 flex items-center gap-2.5">
                <stat.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-display font-bold text-foreground leading-none capitalize">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Acces rapide</h2>
        {cards.map((card, i) => (
          <DashboardCard key={card.to} {...card} delay={0.2 + i * 0.08} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
