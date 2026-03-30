import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">{users.length} utilisateurs enregistrés</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card mt-8">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleBadge[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editingUser ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prénom Nom" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@pompiers.fr" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v: UserRole) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
