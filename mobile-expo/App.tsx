import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DisponibilitesScreen } from './src/screens/DisponibilitesScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { SupervisorScheduleScreen } from './src/screens/SupervisorScheduleScreen';
import { AdminUsersScreen } from './src/screens/AdminUsersScreen';
import { AdminTrainingScreen } from './src/screens/AdminTrainingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SafeAreaView style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Accueil' }} />
            <Stack.Screen name="Disponibilites" component={DisponibilitesScreen} options={{ title: 'Calendrier' }} />
            <Stack.Screen name="Skills" component={SkillsScreen} options={{ title: 'Competences' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="SupervisorSchedule" component={SupervisorScheduleScreen} options={{ title: 'Horaires' }} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Utilisateurs' }} />
            <Stack.Screen name="AdminTraining" component={AdminTrainingScreen} options={{ title: 'Suivi formation' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
