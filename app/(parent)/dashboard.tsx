import { useAuth } from '@clerk/clerk-expo';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Zone } from '@/lib/types';

const ZONE_CONFIG: Record<Zone, { label: string; color: string; bg: string; border: string }> = {
  green: { label: '🟢 Green — Controlled', color: '#4ade80', bg: '#0d2b0d', border: '#4ade80' },
  yellow: { label: '🟡 Yellow — Flaring', color: '#FFD700', bg: '#2b2200', border: '#FFD700' },
  red: { label: '🔴 Red — Severe', color: '#ff4444', bg: '#2b0000', border: '#ff4444' },
};

function NavButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ParentDashboard() {
  const { signOut } = useAuth();
  const { isHydrated, profile, flareLogs, points, currentZone } = useAppStore();

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  if (!profile?.onboardingComplete) {
    return <Redirect href="/(parent)/onboarding" />;
  }

  const zone = currentZone();
  const zc = ZONE_CONFIG[zone];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Greeting */}
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.childName}>{profile.name}'s Quest</Text>

      {/* Dynamic zone card */}
      <View style={[styles.zoneCard, { borderColor: zc.border, backgroundColor: zc.bg }]}>
        <Text style={styles.cardLabel}>CURRENT ZONE</Text>
        <Text style={[styles.cardValue, { color: zc.color }]}>{zc.label}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{flareLogs.length}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>⭐ {points.total}</Text>
          <Text style={styles.statLabel}>Points Balance</Text>
        </View>
      </View>

      {/* Navigation grid */}
      <View style={styles.navGrid}>
        <NavButton icon="📋" label="Flare Logs" onPress={() => router.push('/(parent)/logs')} />
        <NavButton icon="🏥" label="Appointment Summary" onPress={() => router.push('/(parent)/appointment')} />
        <NavButton icon="💬" label="Claude Chat" onPress={() => router.push('/(parent)/chat')} />
        <NavButton icon="🗡️" label="Child View" onPress={() => router.push('/(child)/home')} />
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
  },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 16,
  },
  greeting: { color: '#aaa', fontSize: 16 },
  childName: { color: '#FFD700', fontSize: 28, fontWeight: 'bold' },
  zoneCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardLabel: { color: '#888', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  cardValue: { fontSize: 18, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3a3a5e',
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { color: '#FFD700', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, letterSpacing: 1, fontWeight: '600' },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  navCard: {
    width: '47%',
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  navIcon: { fontSize: 28 },
  navLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  signOutButton: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  signOutText: { color: '#555', fontSize: 14 },
});
