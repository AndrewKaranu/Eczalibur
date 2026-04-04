import * as ExpoCrypto from 'expo-crypto';
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
import { Colors, Fonts } from '@/constants/theme';

export default function StoreScreen() {
  const { isHydrated, prizes, points, redemptions, profile, requestRedemption, spendPoints } = useAppStore();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  if (!isHydrated || !profile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  const activePrizes = prizes.filter((p) => p.isActive);

  function isPending(prizeId: string) {
    return redemptions.some((r) => r.prizeId === prizeId && r.status === 'pending');
  }

  async function handleRedeem(prize: Prize) {
    if (!profile) return;
    if (points.total < prize.pointCost) {
      Alert.alert(
        'Not enough gold!',
        `You need 💰 ${prize.pointCost} but only have 💰 ${points.total}. Keep questing!`,
      );
      return;
    }
    if (isPending(prize.id)) {
      Alert.alert('Already requested', 'The merchant is processing this order.');
      return;
    }

    setRedeeming(prize.id);
    try {
      const redReq: RedemptionRequest = {
        id: ExpoCrypto.randomUUID(),
        childId: profile.id,
        prizeId: prize.id,
        prizeName: prize.name,
        pointCost: prize.pointCost,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      await requestRedemption(redReq);
      Alert.alert('Request Sent!', 'The King (your parent) must approve it.');
    } catch (err) {
      Alert.alert('Error', 'Merchant is busy, try again later.');
    } finally {
      setRedeeming(null);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.titleBadge}>🛡️</Text>
        <Text style={styles.title}>MERCHANT</Text>
      </View>
      <View style={styles.goldBanner}>
        <Text style={styles.goldText}>YOUR STASH: 💰 {points.total}</Text>
      </View>

      <FlatList
        data={activePrizes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>The shop is empty today!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pending = isPending(item.id);
          const canAfford = points.total >= item.pointCost;
          const loading = redeeming === item.id;

          return (
            <View style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
                </View>
              </View>

              <View style={styles.itemFooter}>
                <Text style={[styles.itemCost, !canAfford && styles.itemCostShort]}>
                  💰 {item.pointCost}
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    pending && styles.buyBtnPending,
                    (!canAfford && !pending) && styles.buyBtnDisabled,
                  ]}
                  disabled={loading || pending || (!canAfford)}
                  onPress={() => handleRedeem(item)}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.text} size="small" />
                  ) : (
                    <Text style={styles.buyBtnText}>
                      {pending ? 'WAITING...' : 'BUY'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  loadingScreen: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 16, gap: 12 },
  titleBadge: { fontSize: 24, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  title: { fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 20, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  goldBanner: { backgroundColor: Colors.card, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, borderWidth: 4, borderColor: Colors.gold, marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  goldText: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontFamily: Fonts.pixel, color: '#fff', fontSize: 20, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  
  itemCard: { backgroundColor: Colors.card, borderWidth: 4, borderColor: Colors.cardBorder, padding: 16, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 16 },
  itemIcon: { fontSize: 32 },
  itemInfo: { flex: 1, gap: 6 },
  itemName: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 12 },
  itemDesc: { fontFamily: Fonts.pixel, color: '#444', fontSize: 16 },
  
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 4, borderTopColor: Colors.cardBorder, paddingTop: 16 },
  itemCost: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 14 },
  itemCostShort: { color: Colors.healthRed },
  
  buyBtn: { backgroundColor: '#4ade80', borderWidth: 4, borderColor: '#fff', paddingHorizontal: 16, paddingVertical: 12 },
  buyBtnPending: { backgroundColor: '#FFD700' },
  buyBtnDisabled: { backgroundColor: '#888', borderColor: '#555' },
  buyBtnText: { fontFamily: Fonts.pixelBold, color: '#000', fontSize: 10 },
});
