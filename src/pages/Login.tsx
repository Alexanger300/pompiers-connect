import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Shield, Flame, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-nav" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(0, 72%, 45%) 0%, transparent 50%), radial-gradient(circle at 70% 80%, hsl(35, 92%, 50%) 0%, transparent 50%)'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-2xl"
          >
            <Shield className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">PompierApp</h1>
          <p className="text-nav-foreground/60 mt-1">Gestion des sapeurs-pompiers</p>
        </div>

        <Card className="glass-card border-nav-foreground/10 bg-card/10 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-display font-semibold text-primary-foreground text-center">Connexion</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/20 text-destructive"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-nav-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre.email@pompiers.fr"
                  required
                  className="bg-nav-foreground/5 border-nav-foreground/20 text-primary-foreground placeholder:text-nav-foreground/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-nav-foreground/80">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-nav-foreground/5 border-nav-foreground/20 text-primary-foreground placeholder:text-nav-foreground/30"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground font-semibold h-11 shadow-lg hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <Flame className="w-5 h-5 animate-pulse" />
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-3 rounded-lg bg-nav-foreground/5 border border-nav-foreground/10">
              <p className="text-xs font-medium text-nav-foreground/60 mb-2">Comptes démo :</p>
              <div className="space-y-1 text-xs text-nav-foreground/50">
                <p>📋 stagiaire@pompiers.fr / demo1234</p>
                <p>👁️ superviseur@pompiers.fr / demo1234</p>
                <p>⚙️ admin@pompiers.fr / demo1234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
