import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Zone } from '@/lib/types';
import { Colors, Fonts } from '@/constants/theme';

const ZONE_META: Record<Zone, { label: string; colorKey: string; emoji: string }> = {
  green: { label: 'GREEN ZONE', colorKey: '#4ade80', emoji: '🟢' },
  yellow: { label: 'YELLOW ZONE', colorKey: '#EAB308', emoji: '🟡' },
  red: { label: 'RED ZONE', colorKey: '#EF4444', emoji: '🔴' },
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

        <View style={styles.titleBanner}>
          <Text style={styles.titleBadge}>📜</Text>
          <Text style={styles.title}>HEALING SCROLL</Text>
        </View>

        <Text style={styles.subtitle}>Your path to clear skin</Text>

        <View style={[styles.zoneCard, { borderColor: ZONE_META[zone].colorKey }]}>
          <Text style={[styles.zoneLabel, { color: ZONE_META[zone].colorKey }]}>
            CURRENT STATUS: {ZONE_META[zone].label}
          </Text>
          <Text style={styles.zoneHelper}>Follow the steps below to restore your health!</Text>
        </View>

        {(['green', 'yellow', 'red'] as Zone[]).map((z) => (
          <View key={z} style={[styles.card, z === zone && styles.cardActive, { borderColor: ZONE_META[z].colorKey }]}>
            <View style={[styles.cardHeader, { backgroundColor: ZONE_META[z].colorKey }]}>
              <Text style={styles.cardEmoji}>{ZONE_META[z].emoji}</Text>
              <Text style={[styles.cardTitle, { color: z === 'yellow' ? '#000' : '#fff' }]}>{ZONE_META[z].label}</Text>
            </View>
            <View style={styles.cardContent}>
              {(plan?.[z]?.childInstructions || FALLBACK[z]).map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={styles.stepBullet}>•</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100 },
  titleBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 },
  titleBadge: { fontSize: 24, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  title: { fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 20, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  subtitle: { fontFamily: Fonts.pixel, color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 24, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  
  zoneCard: { backgroundColor: Colors.card, borderWidth: 4, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  zoneLabel: { fontFamily: Fonts.pixelBold, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  zoneHelper: { fontFamily: Fonts.pixel, fontSize: 16, color: '#444', textAlign: 'center' },

  card: { backgroundColor: Colors.card, borderWidth: 4, marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  cardActive: { shadowColor: Colors.gold },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 4, borderBottomColor: Colors.cardBorder, gap: 8 },
  cardEmoji: { fontSize: 16 },
  cardTitle: { fontFamily: Fonts.pixelBold, fontSize: 12 },
  cardContent: { padding: 16, gap: 12 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepBullet: { fontFamily: Fonts.pixelBold, fontSize: 16, color: '#444' },
  stepText: { fontFamily: Fonts.pixel, fontSize: 18, color: '#222', flex: 1, lineHeight: 22 },
});
