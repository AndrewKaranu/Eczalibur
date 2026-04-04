import * as ExpoCrypto from 'expo-crypto';
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
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { BodyArea, FlareLog } from '@/lib/types';
import { Colors, Fonts } from '@/constants/theme';

const MOOD_OPTIONS = [
  { score: 1, emoji: '😊', label: 'Great!' },
  { score: 2, emoji: '🙂', label: 'Okay' },
  { score: 3, emoji: '😕', label: 'Itchy' },
  { score: 4, emoji: '😣', label: 'Very Itchy' },
  { score: 5, emoji: '😭', label: 'Painful' },
];

const ALL_AREAS: BodyArea[] = [
  'face', 'neck', 'chest', 'back', 'arms', 'hands', 'legs', 'feet', 'scalp', 'other',
];

const AREA_LABELS: Record<BodyArea, string> = {
  face: 'Face',
  neck: 'Neck',
  chest: 'Chest',
  back: 'Back',
  arms: 'Arms',
  hands: 'Hands',
  legs: 'Legs',
  feet: 'Feet',
  scalp: 'Scalp',
  other: 'Other',
};

export default function LogScreen() {
  const { profile, addFlareLog, currentZone } = useAppStore();
  const [mood, setMood] = useState<number | null>(null);
  const [areas, setAreas] = useState<BodyArea[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bestZone = currentZone();

  function toggleArea(a: BodyArea) {
    if (areas.includes(a)) setAreas(areas.filter((x) => x !== a));
    else setAreas([...areas, a]);
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'We need access to your photos to save an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!profile) return;
    if (!mood) {
      Alert.alert('Missing Mood', 'How does your skin feel?');
      return;
    }
    if (areas.length === 0) {
      Alert.alert('Missing Location', 'Where does it itch?');
      return;
    }

    setLoading(true);
    try {
      const newLog: FlareLog = {
        id: ExpoCrypto.randomUUID(),
        childId: profile.id,
        timestamp: new Date().toISOString(),
        zone: bestZone,
        moodScore: mood as 1|2|3|4|5,
        affectedAreas: areas,
        photoUri: image || undefined,
        notes: '',
      };
      
      await addFlareLog(newLog);
      
      Alert.alert('Saved!', 'Your journal has been updated. +10 💰', [
        { text: 'OK', onPress: () => router.push('/(child)/home') }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save log.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titleBadge}>📖</Text>
          <Text style={styles.title}>JOURNAL</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>HOW DO YOU FEEL?</Text>
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m.score}
                style={[styles.moodBtn, mood === m.score && styles.moodBtnActive]}
                onPress={() => setMood(m.score)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.score && styles.moodLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>WHERE DOES IT ITCH?</Text>
          <View style={styles.areaGrid}>
            {ALL_AREAS.map((a) => {
              const active = areas.includes(a);
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.areaPill, active && styles.areaPillActive]}
                  onPress={() => toggleArea(a)}
                >
                  <Text style={[styles.areaText, active && styles.areaTextActive]}>{AREA_LABELS[a]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>TAKE A PICTURE?</Text>
          {image ? (
            <View style={styles.imageBox}>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                <Text style={styles.removeText}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Text style={styles.photoText}>📷 ADD PHOTO</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, (!mood || areas.length === 0) && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={!mood || areas.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>SAVE LOG (+10 💰)</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 12 },
  titleBadge: { fontSize: 24, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  title: { fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 20, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  
  card: { backgroundColor: Colors.card, borderWidth: 4, borderColor: Colors.cardBorder, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  cardTitle: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 12, marginBottom: 16, letterSpacing: 1 },
  
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  moodBtn: { alignItems: 'center', backgroundColor: '#a99c7f', padding: 10, borderWidth: 4, borderColor: Colors.cardBorder, minWidth: 70 },
  moodBtnActive: { backgroundColor: Colors.gold, borderColor: '#fff' },
  moodEmoji: { fontSize: 28, marginBottom: 6 },
  moodLabel: { fontFamily: Fonts.pixelBold, color: '#444', fontSize: 8 },
  moodLabelActive: { color: '#000' },
  
  areaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  areaPill: { backgroundColor: '#a99c7f', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 4, borderColor: Colors.cardBorder },
  areaPillActive: { backgroundColor: '#4ade80', borderColor: '#fff' },
  areaText: { fontFamily: Fonts.pixelBold, color: '#222', fontSize: 10 },
  areaTextActive: { color: '#000' },
  
  photoBtn: { backgroundColor: '#2f67b1', paddingVertical: 16, borderWidth: 4, borderColor: '#fff', alignItems: 'center' },
  photoText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 12 },
  
  imageBox: { position: 'relative', width: 120, height: 120, borderWidth: 4, borderColor: Colors.cardBorder },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: Colors.healthRed, width: 30, height: 30, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 12, marginTop: 2 },
  
  saveBtn: { backgroundColor: Colors.gold, borderWidth: 4, borderColor: '#fff', paddingVertical: 18, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  saveBtnDisabled: { backgroundColor: '#888', borderColor: '#555', shadowOpacity: 0 },
  saveBtnText: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 14, textShadowColor: '#fff', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
});
