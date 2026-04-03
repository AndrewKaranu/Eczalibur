import { useState } from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/store/useAppStore';
import { BG, overlayColor } from '@/constants/backgrounds';
import type { FlareLog, Zone } from '@/lib/types';

const ZONE_CONFIG: Record<Zone, { label: string; color: string; bg: string; border: string }> = {
  green: { label: '🟢 Green', color: '#4ade80', bg: '#0d2b0d', border: '#4ade80' },
  yellow: { label: '🟡 Yellow', color: '#FFD700', bg: '#2b2200', border: '#FFD700' },
  red: { label: '🔴 Red', color: '#ff4444', bg: '#2b0000', border: '#ff4444' },
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
  const { isDark } = useTheme();
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
    <ImageBackground source={isDark ? BG.dark : BG.light} style={styles.screen} resizeMode="cover">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor(isDark, 0.50) }]} />
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flare Log History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Zone filter pills */}
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

      {/* Log list */}
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
              No logs yet.{'\n'}Start a quest to log your first flare!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { color: '#FFD700', fontSize: 15, fontWeight: '600' },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: { width: 48 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3a3a5e',
    backgroundColor: '#2a2a3e',
  },
  pillActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  pillText: { color: '#aaa', fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#1a1a2e' },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyContainer: { flex: 1 },
  emptyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a5e',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  zoneBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  zoneBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  logMeta: { flex: 1, gap: 2 },
  logDate: { color: '#fff', fontSize: 13, fontWeight: '600' },
  logMood: { color: '#aaa', fontSize: 12 },
  logAreas: { color: '#888', fontSize: 11 },
  photoTag: { fontSize: 18 },
});
