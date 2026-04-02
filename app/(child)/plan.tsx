import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Zone } from '@/lib/types';

const ZONE_META: Record<Zone, { label: string; color: string; bg: string; emoji: string }> = {
  green: { label: 'GREEN ZONE', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', emoji: '🟢' },
  yellow: { label: 'YELLOW ZONE', color: '#FFD700', bg: 'rgba(255,215,0,0.1)', emoji: '🟡' },
  red: { label: 'RED ZONE', color: '#ff4444', bg: 'rgba(255,68,68,0.1)', emoji: '🔴' },
};

const FALLBACK: Record<Zone, string[]> = {
  green: ['Keep up your moisturising routine', 'Stay cool and avoid triggers', 'Log how you feel each day'],
  yellow: ['Apply your yellow zone cream now', 'Tell a parent your skin is acting up', 'Avoid scratching — try a cold cloth'],
  red: ['Tell a parent RIGHT NOW', 'Apply your red zone medication', 'Do NOT scratch — get help'],
};

export default function PlanScreen() {
  const { profile, currentZone } = useAppStore();
  const plan = profile?.actionPlan;
  const zone = currentZone();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>📜 Your Action Plan</Text>
        <Text style={styles.subtitle}>Know what to do at every stage</Text>

        {((['green', 'yellow', 'red'] as Zone[])).map((z) => {
          const meta = ZONE_META[z];
          const steps = plan ? plan[z].childInstructions : FALLBACK[z];
          const isActive = z === zone;

          return (
            <View key={z} style={[styles.zoneCard, { borderColor: meta.color, backgroundColor: meta.bg }, isActive && styles.activeCard]}>
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: meta.color }]}>
                  <Text style={styles.activeBadgeText}>YOU ARE HERE</Text>
                </View>
              )}
              <Text style={styles.zoneEmoji}>{meta.emoji}</Text>
              <Text style={[styles.zoneLabel, { color: meta.color }]}>{meta.label}</Text>
              {steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={[styles.stepDot, { color: meta.color }]}>▸</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          );
        })}

        {!plan && (
          <Text style={styles.noplan}>
            No action plan yet — complete onboarding to generate your personalised plan.
          </Text>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { paddingBottom: 48, paddingHorizontal: 20, paddingTop: 56 },

  title: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#666', fontSize: 13, marginBottom: 24 },

  zoneCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 8,
    position: 'relative',
  },
  activeCard: {
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  activeBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  zoneEmoji: { fontSize: 28 },
  zoneLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stepDot: { fontSize: 14, lineHeight: 22 },
  stepText: { color: '#ddd', fontSize: 14, lineHeight: 22, flex: 1 },

  noplan: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 },

  backButton: { alignItems: 'center', paddingVertical: 16 },
  backText: { color: '#555', fontSize: 14 },
});
