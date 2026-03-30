import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Calendar, BookOpen, LayoutDashboard, Users, LogOut, User, Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['stagiaire', 'superviseur', 'administrateur'] },
    { to: '/calendrier', label: 'Calendrier', icon: Calendar, roles: ['stagiaire', 'superviseur', 'administrateur'] },
    { to: '/competences', label: 'Compétences', icon: BookOpen, roles: ['stagiaire'] },
    { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['stagiaire', 'superviseur', 'administrateur'] },
    { to: '/superviseur', label: 'Horaires', icon: Shield, roles: ['superviseur'] },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, roles: ['administrateur'] },
    { to: '/admin/suivi', label: 'Suivi formation', icon: BookOpen, roles: ['administrateur'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  const roleBadgeColor = {
    stagiaire: 'bg-accent text-accent-foreground',
    superviseur: 'bg-primary text-primary-foreground',
    administrateur: 'bg-urgent text-urgent-foreground',
  };

  return (
    <nav className="sticky top-0 z-50 bg-nav text-nav-foreground shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:block">PompierApp</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/20 text-primary-foreground'
                      : 'text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <Badge className={`${roleBadgeColor[user.role]} text-xs hidden sm:inline-flex`}>
              {user.role}
            </Badge>
            <Link to="/profil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium hidden lg:block">{user.name}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-nav-foreground/70"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-nav-foreground/10"
          >
            <div className="px-4 py-3 space-y-1">
              {filteredItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/20 text-primary-foreground'
                        : 'text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
