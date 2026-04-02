import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Zone } from '@/lib/types';

const ZONE_CONFIG: Record<Zone, { bg: string; border: string; label: string; emoji: string; questTitle: string }> = {
  green: {
    bg: '#0d2b0d',
    border: '#4ade80',
    label: 'GREEN ZONE',
    emoji: '🟢',
    questTitle: 'Quest Active — Controlled!',
  },
  yellow: {
    bg: '#2b2200',
    border: '#FFD700',
    label: 'YELLOW ZONE',
    emoji: '🟡',
    questTitle: 'Watch Out — Flare Starting!',
  },
  red: {
    bg: '#2b0000',
    border: '#ff4444',
    label: 'RED ZONE',
    emoji: '🔴',
    questTitle: 'DANGER — Flare Active!',
  },
};

const FALLBACK_STEPS = {
  green: ['Keep up your moisturising routine', 'Stay cool and avoid your triggers', 'Log how you\'re feeling each day'],
  yellow: ['Apply your yellow zone cream now', 'Tell a parent your skin is acting up', 'Avoid scratching — try a cold cloth instead'],
  red: ['Tell a parent or trusted adult RIGHT NOW', 'Apply your red zone medication immediately', 'Do NOT scratch — get help'],
};

export default function ChildHome() {
  const { profile, points, currentZone } = useAppStore();
  const zone = currentZone();
  const config = ZONE_CONFIG[zone];
  const plan = profile?.actionPlan;
  const steps = plan ? plan[zone].childInstructions : FALLBACK_STEPS[zone];
  const childName = profile?.name ?? 'Hero';

  return (
    <View style={[styles.screen, { backgroundColor: config.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>⚔️ {childName}'s Quest</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>⭐ {points.total}</Text>
          </View>
        </View>

        {/* Zone Banner */}
        <View style={[styles.zoneBanner, { borderColor: config.border }]}>
          <Text style={styles.zoneEmoji}>{config.emoji}</Text>
          <Text style={[styles.zoneLabel, { color: config.border }]}>{config.label}</Text>
          <Text style={styles.zoneTitle}>{config.questTitle}</Text>
        </View>

        {/* Quest Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsHeader}>🗺️ YOUR QUEST STEPS</Text>
          {steps.map((step, i) => (
            <View key={i} style={[styles.stepCard, { borderLeftColor: config.border }]}>
              <Text style={[styles.stepNumber, { color: config.border }]}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.planButton}
            onPress={() => router.push('/(child)/plan')}
          >
            <Text style={styles.planButtonText}>📜 View Full Action Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logButton}
            onPress={() => router.push('/(child)/log')}
          >
            <Text style={styles.logButtonText}>📝 Log How I Feel (+10 pts)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.storeButton}
            onPress={() => router.push('/(child)/store')}
          >
            <Text style={styles.storeButtonText}>🏆 Prize Store ({points.total} pts)</Text>
          </TouchableOpacity>
        </View>

        {/* Back to parent */}
        <TouchableOpacity style={styles.parentLink} onPress={() => router.replace('/(parent)/dashboard')}>
          <Text style={styles.parentLinkText}>← Parent View</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Emergency button — fixed at bottom */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => router.push('/(child)/emergency')}
        activeOpacity={0.8}
      >
        <Text style={styles.emergencyText}>🚨  MY SKIN IS BAD — GET HELP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 100, paddingHorizontal: 20, paddingTop: 56 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  pointsBadge: { backgroundColor: '#2a2a1a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#FFD700' },
  pointsText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },

  zoneBanner: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  zoneEmoji: { fontSize: 40 },
  zoneLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  zoneTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

  stepsContainer: { marginBottom: 24 },
  stepsHeader: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    alignItems: 'flex-start',
  },
  stepNumber: { fontSize: 16, fontWeight: 'bold', width: 20 },
  stepText: { color: '#ddd', fontSize: 14, lineHeight: 20, flex: 1 },

  actions: { gap: 10, marginBottom: 20 },
  planButton: { backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  planButtonText: { color: '#FFD700', fontWeight: '600', fontSize: 14 },
  logButton: { backgroundColor: 'rgba(74,222,128,0.15)', borderWidth: 1, borderColor: '#4ade80', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logButtonText: { color: '#4ade80', fontWeight: '600', fontSize: 14 },
  storeButton: { backgroundColor: 'rgba(168,85,247,0.15)', borderWidth: 1, borderColor: '#a855f7', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  storeButtonText: { color: '#a855f7', fontWeight: '600', fontSize: 14 },

  parentLink: { alignItems: 'center', paddingVertical: 12 },
  parentLinkText: { color: '#444', fontSize: 13 },

  emergencyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#cc0000',
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 2,
    borderColor: '#ff4444',
  },
  emergencyText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
