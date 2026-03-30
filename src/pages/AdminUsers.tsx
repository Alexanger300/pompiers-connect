import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User, UserRole } from '@/types';

const INITIAL_USERS: User[] = [
  { id: '1', email: 'lucas.martin@pompiers.fr', name: 'Lucas Martin', role: 'stagiaire' },
  { id: '2', email: 'marie.dupont@pompiers.fr', name: 'Marie Dupont', role: 'superviseur' },
  { id: '4', email: 'sophie.bernard@pompiers.fr', name: 'Sophie Bernard', role: 'stagiaire' },
  { id: '5', email: 'thomas.petit@pompiers.fr', name: 'Thomas Petit', role: 'stagiaire' },
  { id: '6', email: 'emma.leroy@pompiers.fr', name: 'Emma Leroy', role: 'stagiaire' },
];

const roleBadge: Record<UserRole, string> = {
  stagiaire: 'bg-accent/20 text-accent',
  superviseur: 'bg-primary/20 text-primary',
  administrateur: 'bg-urgent/20 text-urgent',
};

const AdminUsers = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'stagiaire' as UserRole });

  const openAdd = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'stagiaire' });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
    } else {
      setUsers(prev => [...prev, { id: Date.now().toString(), ...form }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
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

      <div className="space-y-2 mt-5">
        {users.map((user, i) => (
          <motion.div key={user.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="glass-card">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={`${roleBadge[user.role]} text-[10px]`}>{user.role}</Badge>
                </div>
                <div className="flex gap-2 mt-2.5 justify-end">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(user)}>
                    <Pencil className="w-3 h-3 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editingUser ? 'Modifier' : 'Ajouter'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prénom Nom" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@pompiers.fr" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rôle</Label>
              <Select value={form.role} onValueChange={(v: UserRole) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stagiaire">Stagiaire</SelectItem>
                  <SelectItem value="superviseur">Superviseur</SelectItem>
                  <SelectItem value="administrateur">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave}>
              {editingUser ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
