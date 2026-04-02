import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

const FALLBACK_STEPS = [
  'Tell a parent or trusted adult RIGHT NOW',
  'Apply your red zone medication immediately',
  'Do NOT scratch — use a cold cloth on the area',
  'Stay calm — this will get better with help',
  'If it\'s very severe, ask to call the doctor',
];

export default function EmergencyScreen() {
  const { profile } = useAppStore();
  const plan = profile?.actionPlan;
  const steps = plan ? plan.red.childInstructions : FALLBACK_STEPS;
  const childName = profile?.name ?? 'Hero';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Alert header */}
        <View style={styles.alertHeader}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.alertTitle}>FLARE ALERT</Text>
          <Text style={styles.alertSub}>{childName}, follow these steps NOW</Text>
        </View>

        {/* Red zone steps */}
        <View style={styles.stepsBox}>
          <Text style={styles.stepsLabel}>RED ZONE STEPS</Text>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Call parent button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL('tel:')}
          activeOpacity={0.8}
        >
          <Text style={styles.callButtonText}>📞  CALL A PARENT</Text>
        </TouchableOpacity>

        {/* Reassurance */}
        <View style={styles.reassuranceBox}>
          <Text style={styles.reassuranceText}>
            You are BRAVE. 🦁 You're doing the right thing by asking for help. This flare will pass.
          </Text>
        </View>

        {/* I'm OK now — exit */}
        <TouchableOpacity
          style={styles.okButton}
          onPress={() => router.replace('/(child)/home')}
        >
          <Text style={styles.okButtonText}>✓ I got help — I'm OK now</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Pulsing red border effect via border */}
      <View style={styles.borderOverlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a0000' },
  scroll: { paddingBottom: 48, paddingHorizontal: 24, paddingTop: 64 },

  alertHeader: { alignItems: 'center', marginBottom: 32, gap: 8 },
  alertIcon: { fontSize: 72 },
  alertTitle: {
    color: '#ff4444',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#ff000080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  alertSub: { color: '#ffaaaa', fontSize: 16, textAlign: 'center' },

  stepsBox: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ff4444',
    padding: 20,
    marginBottom: 24,
    gap: 14,
  },
  stepsLabel: { color: '#ff4444', fontSize: 10, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  stepRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  stepBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stepText: { color: '#ffdada', fontSize: 15, lineHeight: 22, flex: 1 },

  callButton: {
    backgroundColor: '#ff4444',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff0000',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  callButtonText: { color: '#fff', fontWeight: '900', fontSize: 20, letterSpacing: 1 },

  reassuranceBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  reassuranceText: { color: '#ffcccc', fontSize: 15, textAlign: 'center', lineHeight: 22 },

  okButton: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  okButtonText: { color: '#888', fontSize: 14 },

  borderOverlay: {
    position: 'absolute',
    inset: 0,
    borderWidth: 4,
    borderColor: '#ff444460',
    borderRadius: 0,
    pointerEvents: 'none',
  },
});
