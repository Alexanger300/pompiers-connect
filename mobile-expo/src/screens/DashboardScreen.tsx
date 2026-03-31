import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';

const roleCards = {
  agent: [
    { title: 'Calendrier', route: 'Disponibilites' },
    { title: 'Competences', route: 'Skills' },
    { title: 'Notifications', route: 'Notifications' },
    { title: 'Profil', route: 'Profile' },
  ],
  superviseur: [
    { title: 'Calendrier', route: 'Disponibilites' },
    { title: 'Horaires', route: 'SupervisorSchedule' },
    { title: 'Suivi formation', route: 'AdminTraining' },
    { title: 'Notifications', route: 'Notifications' },
    { title: 'Profil', route: 'Profile' },
  ],
  admin: [
    { title: 'Utilisateurs', route: 'AdminUsers' },
    { title: 'Suivi formation', route: 'AdminTraining' },
    { title: 'Calendrier', route: 'Disponibilites' },
    { title: 'Notifications', route: 'Notifications' },
    { title: 'Profil', route: 'Profile' },
  ],
} as const;

export function DashboardScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const cards = roleCards[user.role] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Bonjour</Text>
          <Text style={styles.name}>{user.prenom} {user.nom}</Text>
          <Text style={styles.role}>Role: {user.role}</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={() => void logout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable key={card.route} style={styles.card} onPress={() => navigation.navigate(card.route)}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSub}>Ouvrir</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  header: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  role: {
    color: '#93c5fd',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  grid: {
    gap: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  cardTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 15,
  },
  cardSub: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 12,
  },
});
