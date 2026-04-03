import { useAuth } from '@clerk/clerk-expo';
import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

import { Colors, Fonts } from '@/constants/theme';

export default function ParentDashboard() {
  const { signOut } = useAuth();
  const { isHydrated, profile } = useAppStore();

  // Wait for AsyncStorage hydration before deciding where to route
  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 16 }}>LOADING...</Text>
      </View>
    );
  }

  // New user — send to onboarding
  if (!profile?.onboardingComplete) {
    return <Redirect href="/(parent)/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>KINGDOM OVERVIEW</Text>
      <Text style={styles.childName}>{profile.name}&apos;s Quest</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>CURRENT ZONE</Text>
        <Text style={styles.cardValue}>GREEN</Text>
        <Text style={styles.cardSub}>Status: Controlled</Text>
      </View>

      <TouchableOpacity style={styles.childButton} onPress={() => router.push('/(child)/home')}>
        <Text style={styles.childButtonText}>START QUEST (CHILD VIEW)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>SAVE & QUIT (Sign Out)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  greeting: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 14, opacity: 0.8 },
  childName: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 24, marginBottom: 16, textShadowColor: '#fff', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  card: {
    backgroundColor: Colors.card,
    padding: 24,
    width: '100%',
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0
  },
  cardLabel: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 12, opacity: 0.8 },
  cardValue: { fontFamily: Fonts.pixelBold, color: Colors.background, fontSize: 28, textShadowColor: '#222', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  cardSub: { fontFamily: Fonts.pixel, color: Colors.text, fontSize: 20 },
  childButton: {
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0
  },
  childButtonText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 12, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  signOutButton: { paddingVertical: 12, marginTop: 12 },
  signOutText: { fontFamily: Fonts.pixel, color: Colors.text, fontSize: 18, textDecorationLine: 'underline' },
});
