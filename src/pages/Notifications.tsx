import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Loader2, Send, Smartphone, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { devicesApi, notificationsApi, usersApi } from '@/lib/api';
import type { AppNotification, Device, NotificationStatus, NotificationType, User } from '@/types';

const Notifications = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientIdsRaw, setRecipientIdsRaw] = useState('');
  const [sendMode, setSendMode] = useState<'broadcast' | 'targeted'>('broadcast');
  const [typeFilter, setTypeFilter] = useState<'all' | NotificationType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | NotificationStatus>('all');

  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [pushToken, setPushToken] = useState('');
  const [deviceName, setDeviceName] = useState('Web Client');

  const canManageNotifications = user?.role === 'admin' || user?.role === 'superviseur';

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (canManageNotifications) {
        const [notifData, userData] = await Promise.all([
          notificationsApi.list(),
          usersApi.list().catch(() => []),
        ]);
        setNotifications(notifData);
        setUsers(userData);
      }

      const deviceData = await devicesApi.list();
      setDevices(deviceData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user?.id, canManageNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const typeOk = typeFilter === 'all' || n.type === typeFilter;
      const statusOk = statusFilter === 'all' || n.status === statusFilter;
      return typeOk && statusOk;
    });
  }, [notifications, typeFilter, statusFilter]);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Le titre et le message sont obligatoires');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (sendMode === 'broadcast') {
        const res = await notificationsApi.sendBroadcast({ title, message });
        setSuccess(`${res.message} (${res.recipients} destinataires)`);
      } else {
        const ids = recipientIdsRaw
          .split(',')
          .map((x) => Number(x.trim()))
          .filter((x) => Number.isInteger(x) && x > 0);

        if (!ids.length) {
          throw new Error('Ajoute au moins un identifiant utilisateur pour le mode cible');
        }

        const res = await notificationsApi.sendTargeted({
          title,
          message,
          recipientUserIds: ids,
        });

        setSuccess(`${res.message} (${res.recipients} destinataires)`);
      }

      setTitle('');
      setMessage('');
      setRecipientIdsRaw('');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible');
    } finally {
      setSaving(false);
    }
  };

  const removeNotification = async (id: number) => {
    setError('');
    try {
      await notificationsApi.remove(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  };

  const saveDevice = async () => {
    if (!pushToken.trim()) {
      setError('Le push token est obligatoire');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await devicesApi.upsert({
        platform,
        pushToken: pushToken.trim(),
        deviceName: deviceName.trim() || undefined,
      });

      setPushToken('');
      setSuccess('Appareil enregistre avec succes');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement appareil impossible');
    } finally {
      setSaving(false);
    }
  };

  const removeDevice = async (id: number) => {
    setError('');
    try {
      await devicesApi.remove(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression appareil impossible');
    }
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {canManageNotifications ? 'Historique et envoi des notifications push' : 'Gestion de vos appareils push'}
        </p>
      </motion.div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <h2 className="font-semibold text-sm">Appareils push</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={platform} onValueChange={(v: 'android' | 'ios') => setPlatform(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
              </SelectContent>
            </Select>
            <Input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Nom appareil" />
            <Input value={pushToken} onChange={(e) => setPushToken(e.target.value)} placeholder="ExpoPushToken[...]" />
          </div>

          <Button onClick={() => void saveDevice()} disabled={saving} className="w-full gradient-primary text-primary-foreground">
            {saving ? 'Enregistrement...' : 'Enregistrer / Mettre a jour device'}
          </Button>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div key={device.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{device.deviceName || 'Appareil sans nom'}</p>
                    <p className="text-xs text-muted-foreground">{device.platform} - {device.pushToken.slice(0, 24)}...</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void removeDevice(device.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!devices.length && <p className="text-xs text-muted-foreground">Aucun appareil enregistre.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {canManageNotifications && (
        <>
          <Card className="glass-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <h2 className="font-semibold text-sm">Envoyer une notification</h2>
              </div>

              <Select value={sendMode} onValueChange={(v: 'broadcast' | 'targeted') => setSendMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                  <SelectItem value="targeted">Ciblee</SelectItem>
                </SelectContent>
              </Select>

              {sendMode === 'targeted' && (
                <>
                  <Input
                    value={recipientIdsRaw}
                    onChange={(e) => setRecipientIdsRaw(e.target.value)}
                    placeholder="IDs destinataires (ex: 12,14,18)"
                  />
                  {!!users.length && (
                    <p className="text-xs text-muted-foreground">
                      Utilisateurs disponibles: {users.map((u) => `${u.id}:${u.prenom} ${u.nom}`).join(' | ')}
                    </p>
                  )}
                </>
              )}

              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={3} />

              <Button onClick={() => void sendNotification()} disabled={saving} className="w-full gradient-primary text-primary-foreground">
                {saving ? 'Envoi...' : 'Envoyer'}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <h2 className="font-semibold text-sm">Historique</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Select value={typeFilter} onValueChange={(v: 'all' | NotificationType) => setTypeFilter(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="broadcast">Broadcast</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v: 'all' | NotificationStatus) => setStatusFilter(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredNotifications.map((notif) => (
                  <div key={notif.id} className="border rounded-lg p-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{notif.title}</p>
                        <Badge>{notif.type}</Badge>
                        <Badge variant="outline">{notif.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleString('fr-FR')} - {notif.recipientCount} destinataires
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => void removeNotification(notif.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {!filteredNotifications.length && <p className="text-xs text-muted-foreground">Aucune notification.</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Notifications;
