import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { BodyArea, FlareLog } from '@/lib/types';

// ─── Mood options ─────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  { score: 1, emoji: '😊', label: 'Great!' },
  { score: 2, emoji: '🙂', label: 'Okay' },
  { score: 3, emoji: '😕', label: 'Itchy' },
  { score: 4, emoji: '😣', label: 'Very Itchy' },
  { score: 5, emoji: '😭', label: 'Painful' },
];

const ALL_AREAS: BodyArea[] = ['face', 'neck', 'chest', 'back', 'arms', 'hands', 'legs', 'feet', 'scalp', 'other'];

const AREA_LABELS: Record<BodyArea, string> = {
  face: 'Face', neck: 'Neck', chest: 'Chest', back: 'Back',
  arms: 'Arms', hands: 'Hands', legs: 'Legs', feet: 'Feet',
  scalp: 'Scalp', other: 'Other',
};

type Step = 1 | 2 | 3 | 'done';

export default function LogScreen() {
  const { profile, points, currentZone, addFlareLog, awardPoints } = useAppStore();
  const zone = currentZone();
  const childName = profile?.name ?? 'Hero';

  // Pre-select the monitored areas from onboarding
  const monitoredAreas = profile?.affectedAreas ?? [];

  const [step, setStep] = useState<Step>(1);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<BodyArea[]>(monitoredAreas);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [loading, setLoading] = useState(false);

  function toggleArea(area: BodyArea) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!moodScore) return;
    setLoading(true);

    const earned = photoUri ? 15 : 10;
    const log: FlareLog = {
      id: `log_${Date.now()}`,
      childId: profile?.id ?? 'unknown',
      timestamp: new Date().toISOString(),
      zone,
      moodScore,
      affectedAreas: selectedAreas,
      notes: '',
      photoUri: photoUri ?? null,
      pointsAwarded: earned,
    };

    await addFlareLog(log);
    await awardPoints(earned);

    setPointsEarned(earned);
    setLoading(false);
    setStep('done');
  }

  // ─── Step: Done ──────────────────────────────────────────────────────────────

  if (step === 'done') {
    return (
      <View style={styles.screen}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>⭐</Text>
          <Text style={styles.doneTitle}>Quest logged!</Text>
          <Text style={styles.doneSubtitle}>
            You earned {pointsEarned} points.{'\n'}Total: ⭐ {points.total + pointsEarned}
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(child)/home')}>
            <Text style={styles.doneButtonText}>Back to Quest</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 1: Mood face picker ────────────────────────────────────────────────

  if (step === 1) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
          <Text style={styles.title}>How does your skin feel?</Text>
          <Text style={styles.subtitle}>Tap the face that matches right now</Text>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map(({ score, emoji, label }) => (
              <TouchableOpacity
                key={score}
                style={[styles.moodCard, moodScore === score && styles.moodCardSelected]}
                onPress={() => setMoodScore(score)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodLabel, moodScore === score && styles.moodLabelSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.nextButton, !moodScore && styles.nextButtonDisabled]}
            onPress={() => moodScore && setStep(2)}
            disabled={!moodScore}
          >
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>← Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── Step 2: Body area selection ─────────────────────────────────────────────

  if (step === 2) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
          <Text style={styles.title}>Where is it bothering you?</Text>
          <Text style={styles.subtitle}>Tap all areas that feel itchy or sore today</Text>

          <View style={styles.chipGrid}>
            {ALL_AREAS.map((area) => {
              const isSelected = selectedAreas.includes(area);
              const isMonitored = monitoredAreas.includes(area);
              return (
                <TouchableOpacity
                  key={area}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    isMonitored && !isSelected && styles.chipMonitored,
                  ]}
                  onPress={() => toggleArea(area)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {isMonitored ? '📍 ' : ''}{AREA_LABELS[area]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.hint}>📍 = areas your parent set up to watch</Text>

          <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => setStep(1)}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── Step 3: Optional photo ───────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
        <Text style={styles.title}>Take a photo? (+5 bonus pts)</Text>
        <Text style={styles.subtitle}>
          A photo helps track how your skin is changing over time.{'\n'}This is optional — you can skip it!
        </Text>

        {photoUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhotoUri(null)}>
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoButton} onPress={pickPhoto} activeOpacity={0.7}>
            <Text style={styles.photoButtonEmoji}>📷</Text>
            <Text style={styles.photoButtonText}>Add a photo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.nextButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving…' : `✓ Log it! (+${photoUri ? 15 : 10} pts)`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => setStep(2)}>
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  stepLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#888', fontSize: 14, lineHeight: 20, marginBottom: 32 },
  hint: { color: '#555', fontSize: 12, marginBottom: 24, textAlign: 'center' },

  // Mood
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32 },
  moodCard: {
    width: 90, paddingVertical: 18, borderRadius: 16,
    alignItems: 'center', gap: 8,
    backgroundColor: '#2a2a3e', borderWidth: 2, borderColor: '#3a3a5e',
  },
  moodCardSelected: { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.15)' },
  moodEmoji: { fontSize: 36 },
  moodLabel: { color: '#888', fontSize: 12, fontWeight: '600' },
  moodLabelSelected: { color: '#FFD700' },

  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#2a2a3e', borderWidth: 1.5, borderColor: '#3a3a5e',
  },
  chipSelected: { backgroundColor: 'rgba(255,215,0,0.15)', borderColor: '#FFD700' },
  chipMonitored: { borderColor: '#4ade80', borderStyle: 'dashed' },
  chipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#FFD700' },

  // Photo
  photoButton: {
    borderWidth: 2, borderColor: '#3a3a5e', borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 40, alignItems: 'center',
    gap: 12, marginBottom: 32,
  },
  photoButtonEmoji: { fontSize: 40 },
  photoButtonText: { color: '#888', fontSize: 15, fontWeight: '600' },
  photoPreviewContainer: { marginBottom: 32, alignItems: 'center', gap: 12 },
  photoPreview: { width: '100%', height: 220, borderRadius: 16 },
  removePhotoButton: { paddingVertical: 6, paddingHorizontal: 16 },
  removePhotoText: { color: '#ff6b6b', fontSize: 13 },

  // Buttons
  nextButton: {
    backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
  submitButton: {
    backgroundColor: '#4ade80', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  submitButtonText: { color: '#0a1a0a', fontWeight: 'bold', fontSize: 16 },
  backLink: { alignItems: 'center', paddingVertical: 10 },
  backLinkText: { color: '#444', fontSize: 14 },

  // Done
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  doneEmoji: { fontSize: 72 },
  doneTitle: { color: '#FFD700', fontSize: 28, fontWeight: 'bold' },
  doneSubtitle: { color: '#aaa', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  doneButton: {
    backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 16,
    paddingHorizontal: 40, marginTop: 8,
  },
  doneButtonText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
});
