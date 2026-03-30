import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Calendar, BookOpen, LayoutDashboard, Users, LogOut, User, Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { to: '/dashboard', label: 'Accueil', icon: LayoutDashboard, roles: ['stagiaire', 'superviseur', 'administrateur'] },
    { to: '/calendrier', label: 'Calendrier', icon: Calendar, roles: ['stagiaire', 'superviseur', 'administrateur'] },
    { to: '/competences', label: 'Compétences', icon: BookOpen, roles: ['stagiaire'] },
    { to: '/superviseur', label: 'Horaires', icon: CheckCircle, roles: ['superviseur'] },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, roles: ['administrateur'] },
    { to: '/notifications', label: 'Alertes', icon: Bell, roles: ['stagiaire', 'superviseur', 'administrateur'] },
    { to: '/profil', label: 'Profil', icon: User, roles: ['stagiaire', 'superviseur', 'administrateur'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));
  // Show max 5 items in bottom bar
  const bottomItems = filteredItems.slice(0, 5);

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-nav text-nav-foreground shadow-lg">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base">PompierApp</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary-foreground text-[10px] px-2 py-0.5">
              {user.role}
            </Badge>
            <button onClick={logout} className="p-2 text-nav-foreground/60 hover:text-nav-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-[430px] mx-auto flex items-center justify-around h-16 px-1">
          {bottomItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-[56px] ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area padding for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default Navbar;
