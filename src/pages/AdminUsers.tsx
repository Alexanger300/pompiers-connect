import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User, UserRole } from '@/types';
import { authApi, tokenStorage, usersApi } from '@/lib/api';

const roleBadge: Record<UserRole, string> = {
  agent: 'bg-accent/20 text-accent',
  superviseur: 'bg-primary/20 text-primary',
  admin: 'bg-urgent/20 text-urgent',
};

const initialForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  role: 'agent' as UserRole,
  password: '',
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)),
    [users],
  );

  const openAdd = () => {
    setEditingUser(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone ?? '',
      role: user.role,
      password: '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone || undefined,
        });

        if (editingUser.role !== form.role) {
          await usersApi.updateRole(editingUser.id, form.role);
        }
      } else {
        if (!form.password.trim()) {
          throw new Error('Le mot de passe est obligatoire pour creer un compte');
        }

        const currentAccess = tokenStorage.getAccessToken();
        const currentRefresh = tokenStorage.getRefreshToken();
        const currentUser = tokenStorage.getUser();

        await authApi.register({
          email: form.email,
          password: form.password,
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone || undefined,
          role: form.role,
          deviceName: 'Admin Web',
        });

        if (currentAccess && currentRefresh) {
          tokenStorage.setTokens({
            accessToken: currentAccess,
            refreshToken: currentRefresh,
          });
        }

        if (currentUser) {
          tokenStorage.setUser(currentUser);
        }
      }

      setDialogOpen(false);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      await usersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  };

  return (
    <div className="px-4 py-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{users.length} comptes</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </motion.div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
        </div>
      ) : (
        <div className="space-y-2 mt-5">
          {sortedUsers.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="glass-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                        {`${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{user.prenom} {user.nom}</p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge className={`${roleBadge[user.role]} text-[10px]`}>{user.role}</Badge>
                  </div>
                  <div className="flex gap-2 mt-2.5 justify-end">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(user)}>
                      <Pencil className="w-3 h-3 mr-1" /> Modifier
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => void handleDelete(user.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editingUser ? 'Modifier' : 'Ajouter'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Prenom</Label>
                <Input value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} placeholder="Jean" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nom</Label>
                <Input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} placeholder="Dupont" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@pompiers.fr" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telephone</Label>
              <Input value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} placeholder="0600000000" />
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label className="text-xs">Mot de passe initial</Label>
                <Input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" placeholder="********" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v: UserRole) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="superviseur">Superviseur</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Sauvegarde...' : editingUser ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
