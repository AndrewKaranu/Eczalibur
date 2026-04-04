import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import type { FlareLog, Zone } from '@/lib/types';
import { Colors, Fonts } from '@/constants/theme';

const ZONE_CONFIG: Record<Zone, { label: string; color: string; bg: string; border: string }> = {
  green: { label: '🟢 Green', color: '#000', bg: '#4ade80', border: '#fff' },
  yellow: { label: '🟡 Yellow', color: '#000', bg: '#FFD700', border: '#fff' },
  red: { label: '🔴 Red', color: '#fff', bg: '#ff4444', border: '#ffc1c1' },
};

const MOOD_EMOJIS = ['', '😊', '🙂', '😕', '😣', '😭'];

type Filter = 'all' | Zone;

function LogRow({ log }: { log: FlareLog }) {
  const zc = ZONE_CONFIG[log.zone];
  const date = new Date(log.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.logRow}>
      <View style={[styles.zoneBadge, { backgroundColor: zc.bg, borderColor: zc.border }]}>
        <Text style={[styles.zoneBadgeText, { color: zc.color }]}>{zc.label}</Text>
      </View>
      <View style={styles.logMeta}>
        <Text style={styles.logDate}>{date}</Text>
        <Text style={styles.logMood}>
          {MOOD_EMOJIS[log.moodScore]} Itch {log.moodScore}/5
        </Text>
        <Text style={styles.logAreas} numberOfLines={1}>
          {log.affectedAreas.join(', ')}
        </Text>
      </View>
      {log.photoUri ? <Text style={styles.photoTag}>📷</Text> : null}
    </View>
  );
}

export default function LogsScreen() {
  const { flareLogs } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filteredLogs = [...flareLogs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .filter((log) => activeFilter === 'all' || log.zone === activeFilter);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'green', label: '🟢' },
    { key: 'yellow', label: '🟡' },
    { key: 'red', label: '🔴' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>FLARE LOG</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.pill, activeFilter === key && styles.pillActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.pillText, activeFilter === key && styles.pillTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogRow log={item} />}
        contentContainerStyle={
          filteredLogs.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Text style={styles.emptyText}>
              No logs yet.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 10 },
  title: { flex: 1, fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 16, textAlign: 'center', textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  headerSpacer: { width: 48 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 4, borderColor: Colors.cardBorder, backgroundColor: Colors.card, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  pillActive: { backgroundColor: Colors.gold, borderColor: '#fff' },
  pillText: { fontFamily: Fonts.pixelBold, color: '#444', fontSize: 10 },
  pillTextActive: { color: '#000' },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyContainer: { flex: 1 },
  emptyInner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontFamily: Fonts.pixel, color: '#fff', fontSize: 24, textAlign: 'center', lineHeight: 32, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  
  logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 4, borderColor: Colors.cardBorder, padding: 14, marginBottom: 16, gap: 12, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  zoneBadge: { borderWidth: 2, paddingHorizontal: 6, paddingVertical: 4, minWidth: 60, alignItems: 'center' },
  zoneBadgeText: { fontFamily: Fonts.pixelBold, fontSize: 8, letterSpacing: 0.5 },
  logMeta: { flex: 1, gap: 4 },
  logDate: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 11 },
  logMood: { fontFamily: Fonts.pixel, color: '#222', fontSize: 16 },
  logAreas: { fontFamily: Fonts.pixelBold, color: '#444', fontSize: 10 },
  photoTag: { fontSize: 24 },
});
