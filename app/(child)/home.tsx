import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Zone } from '@/lib/types';

import { Colors, Fonts } from '@/constants/theme';

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
    <View style={styles.screen}>
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
  screen: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, paddingBottom: 100, paddingHorizontal: 20, paddingTop: 56, backgroundColor: 'transparent' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 16, flexShrink: 1, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  pointsBadge: { backgroundColor: Colors.card, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 4, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  pointsText: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 12 },

  zoneBanner: {
    borderWidth: 6,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
    backgroundColor: Colors.card,
    shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0
  },
  zoneEmoji: { fontSize: 56 },
  zoneLabel: { fontFamily: Fonts.pixelBold, fontSize: 12, letterSpacing: 2, marginBottom: 8, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  zoneTitle: { fontFamily: Fonts.pixel, color: Colors.text, fontSize: 24, textAlign: 'center' },

  stepsContainer: { marginBottom: 28, backgroundColor: Colors.card, padding: 16, borderWidth: 4, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  stepsHeader: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 10, marginBottom: 16, opacity: 0.8 },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: { fontFamily: Fonts.pixelBold, fontSize: 14, width: 20, marginTop: 4 },
  stepText: { fontFamily: Fonts.pixel, color: Colors.text, fontSize: 22, lineHeight: 26, flex: 1 },

  actions: { gap: 16, marginBottom: 32 },
  planButton: { backgroundColor: '#e2dabc', borderWidth: 4, borderColor: Colors.cardBorder, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  planButtonText: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 10 },
  logButton: { backgroundColor: Colors.accent, borderWidth: 4, borderColor: Colors.cardBorder, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  logButtonText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 10, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  storeButton: { backgroundColor: Colors.gold, borderWidth: 4, borderColor: Colors.cardBorder, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  storeButtonText: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 10 },

  parentLink: { alignItems: 'center', paddingVertical: 16, backgroundColor: Colors.card, borderWidth: 4, borderColor: Colors.cardBorder, marginHorizontal: 32, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  parentLinkText: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 10 },

  emergencyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.healthRed,
    paddingVertical: 24,
    paddingBottom: 40,
    alignItems: 'center',
    borderTopWidth: 6,
    borderColor: '#000',
  },
  emergencyText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 12, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
});
