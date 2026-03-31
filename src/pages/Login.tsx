import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Flame, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import logoPompiers from '@/assets/logo-pompiers.png';

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

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1220] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#09111f] via-[#101a2b] to-[#1a0f10]" />

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] rounded-full bg-red-600 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[280px] h-[280px] rounded-full bg-blue-700 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="flex justify-center"
          >
            <div className="bg-white/95 rounded-full p-2 shadow-2xl border border-white/40">
              <img
                src={logoPompiers}
                alt="Logo Sapeurs-Pompiers Chessy"
                className="w-28 h-28 object-contain rounded-full"
              />
            </div>
          </motion.div>

          <h1 className="mt-5 text-4xl font-bold text-white tracking-tight">PompierApp</h1>

          <p className="mt-2 text-sm text-gray-300">Sapeurs-Pompiers 77 - Centre de secours de Chessy</p>
        </div>

        <Card className="border border-white/10 bg-white shadow-2xl rounded-3xl">
          <CardHeader className="pb-2 pt-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Connexion</h2>
            <p className="text-center text-sm text-gray-500 mt-1">Accedez a votre espace operationnel</p>
          </CardHeader>

          <CardContent className="pt-4 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@pompiers.fr"
                  required
                  className="h-12 rounded-xl border-gray-300 bg-white text-black placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 font-medium">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="h-12 rounded-xl border-gray-300 bg-white text-black placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-red-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-all"
              >
                {loading ? <Flame className="w-5 h-5 animate-pulse" /> : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
