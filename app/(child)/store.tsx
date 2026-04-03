import * as ExpoCrypto from 'expo-crypto';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Prize, RedemptionRequest } from '@/lib/types';

export default function StoreScreen() {
  const { isHydrated, prizes, points, redemptions, profile, requestRedemption, spendPoints } =
    useAppStore();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  if (!isHydrated || !profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  const activePrizes = prizes.filter((p) => p.isActive);
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');

  function isPending(prizeId: string) {
    return redemptions.some((r) => r.prizeId === prizeId && r.status === 'pending');
  }

  async function handleRedeem(prize: Prize) {
    if (!profile) return;
    if (points.total < prize.pointCost) {
      Alert.alert(
        'Not enough points',
        `You need ⭐ ${prize.pointCost} but only have ⭐ ${points.total}. Keep logging to earn more!`,
      );
      return;
    }
    if (isPending(prize.id)) {
      Alert.alert('Already requested', 'This prize request is waiting for parent approval.');
      return;
    }

    setRedeeming(prize.id);
    try {
      const request: RedemptionRequest = {
        id: ExpoCrypto.randomUUID(),
        childId: profile.id,
        prizeId: prize.id,
        prizeName: prize.name,
        pointCost: prize.pointCost,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        resolvedAt: null,
      };
      await requestRedemption(request);
      await spendPoints(prize.pointCost);
      Alert.alert('Request sent! 🎉', `Your parent will approve "${prize.name}" soon.`);
    } finally {
      setRedeeming(null);
    }
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Prize Store</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {points.total}</Text>
        </View>
      </View>

      {/* Prizes list */}
      {activePrizes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyTitle}>No prizes yet</Text>
          <Text style={styles.emptySubtitle}>
            Ask your parent to add prizes in the dashboard!
          </Text>
        </View>
      ) : (
        <FlatList
          data={activePrizes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const pending = isPending(item.id);
            const canAfford = points.total >= item.pointCost;
            const isLoading = redeeming === item.id;

            return (
              <View style={styles.prizeCard}>
                <Text style={styles.prizeIcon}>{item.icon}</Text>
                <View style={styles.prizeInfo}>
                  <Text style={styles.prizeName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.prizeDesc}>{item.description}</Text>
                  ) : null}
                  <Text style={[styles.prizeCost, !canAfford && styles.prizeCostInsufficient]}>
                    ⭐ {item.pointCost} pts
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.redeemBtn,
                    (pending || !canAfford || isLoading) && styles.redeemBtnDisabled,
                  ]}
                  onPress={() => handleRedeem(item)}
                  disabled={pending || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#1a1a2e" />
                  ) : (
                    <Text style={styles.redeemBtnText}>
                      {pending ? '⏳ Pending' : 'Redeem'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Pending requests footer */}
      {pendingRedemptions.length > 0 && (
        <View style={styles.pendingFooter}>
          <Text style={styles.pendingTitle}>Waiting for parent approval</Text>
          {pendingRedemptions.map((r) => (
            <Text key={r.id} style={styles.pendingItem}>
              • {r.prizeName} (⭐ {r.pointCost})
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  back: { color: '#FFD700', fontSize: 22, fontWeight: 'bold', paddingRight: 4 },
  title: { color: '#FFD700', fontSize: 22, fontWeight: 'bold', flex: 1 },
  pointsBadge: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsText: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  prizeCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  prizeIcon: { fontSize: 36 },
  prizeInfo: { flex: 1, gap: 2 },
  prizeName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  prizeDesc: { color: '#aaa', fontSize: 13 },
  prizeCost: { color: '#FFD700', fontSize: 13, fontWeight: '600', marginTop: 4 },
  prizeCostInsufficient: { color: '#666' },
  redeemBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  redeemBtnDisabled: { backgroundColor: '#3a3a5e' },
  redeemBtnText: { color: '#1a1a2e', fontSize: 13, fontWeight: 'bold' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  emptySubtitle: { color: '#666', fontSize: 14, textAlign: 'center' },
  pendingFooter: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    padding: 14,
    gap: 6,
  },
  pendingTitle: { color: '#FFD700', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  pendingItem: { color: '#ccc', fontSize: 13 },
});
