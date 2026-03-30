import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, Bell, Users, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardCard = ({
  title, description, icon: Icon, to, color, delay
}: {
  title: string; description: string; icon: React.ElementType; to: string; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Link to={to}>
      <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
        <CardContent className="p-6">
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  const stagiaireCards = [
    { title: 'Calendrier', description: 'Choisir vos horaires de garde', icon: Calendar, to: '/calendrier', color: 'gradient-primary' },
    { title: 'Compétences', description: 'Suivi de formation', icon: BookOpen, to: '/competences', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Messages et alertes', icon: Bell, to: '/notifications', color: 'bg-success' },
  ];

  const superviseurCards = [
    { title: 'Calendrier', description: 'Voir les plannings', icon: Calendar, to: '/calendrier', color: 'gradient-primary' },
    { title: 'Confirmer horaires', description: 'Valider les gardes stagiaires', icon: CheckCircle, to: '/superviseur', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Messages et alertes', icon: Bell, to: '/notifications', color: 'bg-success' },
  ];

  const adminCards = [
    { title: 'Utilisateurs', description: 'Gérer les comptes', icon: Users, to: '/admin/utilisateurs', color: 'gradient-primary' },
    { title: 'Suivi formation', description: 'Progression des stagiaires', icon: BookOpen, to: '/admin/suivi', color: 'gradient-accent' },
    { title: 'Notifications', description: 'Envoyer des alertes', icon: Bell, to: '/notifications', color: 'bg-urgent' },
    { title: 'Calendrier', description: 'Vue globale', icon: Calendar, to: '/calendrier', color: 'bg-success' },
  ];

  const cards = user.role === 'administrateur' ? adminCards : user.role === 'superviseur' ? superviseurCards : stagiaireCards;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Bonjour, <span className="text-gradient">{user.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.role === 'stagiaire' && 'Bienvenue dans votre espace stagiaire'}
          {user.role === 'superviseur' && 'Gérez les horaires de vos stagiaires'}
          {user.role === 'administrateur' && 'Tableau de bord administrateur'}
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Gardes ce mois', value: '12', icon: Clock },
          { label: 'Compétences validées', value: '67%', icon: BookOpen },
          { label: 'Notifications', value: '3', icon: Bell },
          { label: 'Jours restants', value: '45', icon: Calendar },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {cards.map((card, i) => (
          <DashboardCard key={card.to} {...card} delay={0.3 + i * 0.1} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
