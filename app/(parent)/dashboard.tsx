import { useAuth } from '@clerk/clerk-expo';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export default function ParentDashboard() {
  const { signOut } = useAuth();
  const { isHydrated, profile } = useAppStore();

  // Wait for AsyncStorage hydration before deciding where to route
  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  // New user — send to onboarding
  if (!profile?.onboardingComplete) {
    return <Redirect href="/(parent)/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.childName}>{profile.name}'s Quest</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>CURRENT ZONE</Text>
        <Text style={styles.cardValue}>🟢 Green — Controlled</Text>
      </View>

      <TouchableOpacity style={styles.childButton} onPress={() => router.push('/(child)/home')}>
        <Text style={styles.childButtonText}>🗡️ Switch to Child View</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  greeting: { color: '#aaa', fontSize: 16 },
  childName: { color: '#FFD700', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  card: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#3a3a5e',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: { color: '#888', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  cardValue: { color: '#4ade80', fontSize: 18, fontWeight: 'bold' },
  childButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  childButtonText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
  signOutButton: { paddingVertical: 12, marginTop: 8 },
  signOutText: { color: '#555', fontSize: 14 },
});
