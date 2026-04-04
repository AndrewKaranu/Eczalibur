import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors, Fonts } from '@/constants/theme';

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

export default function AppointmentScreen() {
  const { isHydrated, profile, flareLogs } = useAppStore();

  const [appointmentDate, setAppointmentDate] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!isHydrated) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  async function handleGenerate() {
    if (!isValidDate(appointmentDate)) {
      Alert.alert('Invalid date', 'Please enter the date in YYYY-MM-DD format (e.g. 2026-05-15).');
      return;
    }
    if (!profile) {
      Alert.alert('No profile', 'Complete onboarding before generating a summary.');
      return;
    }
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch('/api/appointment-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, logs: flareLogs, appointmentDate }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setSummary(data.summary ?? '');
    } catch (err) {
      Alert.alert('Generation failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!summary) return;
    setSharing(true);
    try {
      // Stub for sharing logic
      Alert.alert('Share', 'Sharing logic would go here (requires expo-sharing & expo-file-system).');
    } catch (err) {
      Alert.alert('Share failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSharing(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>DOC SCRIBE</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Privacy disclosure */}
        <View style={styles.disclosureBanner}>
          <Text style={styles.disclosureText}>
            🔒 This data is shared with the AI Scribe only to generate this summary. Not stored on any server.
          </Text>
        </View>

        {/* Date input */}
        <Text style={styles.label}>APPOINTMENT DATE</Text>
        <TextInput
          style={styles.input}
          value={appointmentDate}
          onChangeText={setAppointmentDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          autoCapitalize="none"
        />

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, loading && styles.disabledBtn]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.generateBtnText}>GENERATE SCROLL</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingText}>Scribing summary…</Text>
        )}

        {/* Summary output */}
        {summary && !loading && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>CLINICAL SCROLL</Text>
            <Text style={styles.summaryText} selectable>
              {summary}
            </Text>
          </View>
        )}

        {/* Share button */}
        {summary && !loading && (
          <TouchableOpacity
            style={[styles.shareBtn, sharing && styles.disabledBtn]}
            onPress={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.shareBtnText}>📬 SHARE SCROLL</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  loadingScreen: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 48, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 10 },
  title: { flex: 1, fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 16, textAlign: 'center', textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  headerSpacer: { width: 48 },
  
  disclosureBanner: { backgroundColor: 'rgba(0,0,0,0.5)', borderBottomWidth: 4, borderColor: Colors.cardBorder, paddingHorizontal: 16, paddingVertical: 12 },
  disclosureText: { fontFamily: Fonts.pixel, color: '#ccc', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  
  label: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 12, marginTop: 8 },
  input: { backgroundColor: Colors.card, borderWidth: 4, borderColor: Colors.cardBorder, paddingHorizontal: 16, paddingVertical: 14, fontFamily: Fonts.pixel, fontSize: 16, color: Colors.text, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  
  generateBtn: { backgroundColor: Colors.gold, borderWidth: 4, borderColor: '#fff', paddingVertical: 16, alignItems: 'center', marginTop: 12, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  generateBtnText: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 14 },
  disabledBtn: { opacity: 0.7, shadowOpacity: 0 },
  loadingText: { fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 12, textAlign: 'center' },
  
  summaryCard: { backgroundColor: Colors.card, borderWidth: 4, borderColor: Colors.cardBorder, padding: 16, marginTop: 12, gap: 12, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  summaryLabel: { fontFamily: Fonts.pixelBold, color: '#666', fontSize: 10, letterSpacing: 1 },
  summaryText: { fontFamily: Fonts.pixel, color: Colors.text, fontSize: 16, lineHeight: 24 },
  
  shareBtn: { backgroundColor: '#4ade80', borderWidth: 4, borderColor: '#fff', paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  shareBtnText: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 14 },
});
