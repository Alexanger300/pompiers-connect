import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, Shield, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from '@/types';

const Profile = () => {
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const data = await usersApi.getById(user.id);
        setProfile(data);
        await refreshMe();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de chargement');
      }
    };

    void load();
  }, [user, refreshMe]);

  if (!profile) return null;

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Mon profil</h1>
      </motion.div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="glass-card mt-5">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
              <UserIcon className="w-10 h-10 text-primary-foreground" />
            </div>

            <h2 className="font-display text-xl font-bold text-foreground">
              {profile.prenom} {profile.nom}
            </h2>

            <Badge className="mt-1.5 gradient-primary text-primary-foreground text-xs">
              {profile.role}
            </Badge>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Téléphone</p>
                  <p className="text-sm font-medium text-foreground">
                    {profile.telephone || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Rôle</p>
                  <p className="text-sm font-medium text-foreground capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;