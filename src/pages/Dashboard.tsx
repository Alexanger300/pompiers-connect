import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, BookOpen, Bell, Users, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardCard = ({
  title, description, icon: Icon, to, color, delay
}: {
  title: string; description: string; icon: React.ElementType; to: string; color: string; delay: number;
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

  const stagiaireCards = [
    { title: 'Calendrier', description: 'Choisir vos horaires', icon: Calendar, to: '/calendrier', color: 'gradient-primary' },
    { title: 'Compétences', description: 'Suivi de formation', icon: BookOpen, to: '/competences', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Messages et alertes', icon: Bell, to: '/notifications', color: 'bg-success' },
  ];

  const superviseurCards = [
    { title: 'Calendrier', description: 'Voir les plannings', icon: Calendar, to: '/calendrier', color: 'gradient-primary' },
    { title: 'Confirmer horaires', description: 'Valider les gardes', icon: CheckCircle, to: '/superviseur', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Messages et alertes', icon: Bell, to: '/notifications', color: 'bg-success' },
  ];

  const adminCards = [
    { title: 'Utilisateurs', description: 'Gérer les comptes', icon: Users, to: '/admin/utilisateurs', color: 'gradient-primary' },
    { title: 'Suivi formation', description: 'Progression stagiaires', icon: BookOpen, to: '/admin/suivi', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Envoyer des alertes', icon: Bell, to: '/notifications', color: 'bg-urgent' },
    { title: 'Calendrier', description: 'Vue globale', icon: Calendar, to: '/calendrier', color: 'bg-success' },
  ];

  const cards = user.role === 'administrateur' ? adminCards : user.role === 'superviseur' ? superviseurCards : stagiaireCards;

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground text-sm">Bonjour 👋</p>
        <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
          <span className="text-gradient">{user.name}</span>
        </h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[
          { label: 'Gardes ce mois', value: '12', icon: Clock },
          { label: 'Compétences', value: '67%', icon: BookOpen },
          { label: 'Notifications', value: '3', icon: Bell },
          { label: 'Jours restants', value: '45', icon: Calendar },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-card">
              <CardContent className="p-3 flex items-center gap-2.5">
                <stat.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xl font-display font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action cards */}
      <div className="space-y-3 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Accès rapide</h2>
        {cards.map((card, i) => (
          <DashboardCard key={card.to} {...card} delay={0.2 + i * 0.08} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
