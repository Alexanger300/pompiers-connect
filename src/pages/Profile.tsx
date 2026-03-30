import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Mon profil</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card mt-8">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">{user.name}</h2>
            <Badge className="mt-2 gradient-primary text-primary-foreground">{user.role}</Badge>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rôle</p>
                  <p className="font-medium text-foreground capitalize">{user.role}</p>
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
