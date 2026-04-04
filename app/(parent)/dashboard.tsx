import { Colors, Fonts } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type { RedemptionRequest, Zone } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ZONE_CONFIG: Record<
  Zone,
  { label: string; color: string; bg: string; border: string }
> = {
  green: {
    label: "🟢 Green — Controlled",
    color: "#4ade80",
    bg: "#0d2b0d",
    border: "#4ade80",
  },
  yellow: {
    label: "🟡 Yellow — Flaring",
    color: "#FFD700",
    bg: "#2b2200",
    border: "#FFD700",
  },
  red: {
    label: "🔴 Red — Severe",
    color: "#ef4444",
    bg: "#2b0000",
    border: "#ef4444",
  },
};

export default function ParentDashboard() {
  const { signOut } = useAuth();
  const { toggleTheme } = useTheme();
  const {
    isHydrated,
    profile,
    flareLogs,
    points,
    redemptions,
    currentZone,
    resolveRedemption,
    awardPoints,
  } = useAppStore();

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <Text
          style={{ fontFamily: Fonts.pixelBold, color: "#fff", fontSize: 16 }}
        >
          LOADING...
        </Text>
      </View>
    );
  }

  if (!profile?.onboardingComplete) {
    return <Redirect href="/(parent)/onboarding" />;
  }

  async function handleResolve(
    r: RedemptionRequest,
    decision: "approved" | "denied",
  ) {
    await resolveRedemption(r.id, decision);
    if (decision === "denied") {
      await awardPoints(r.pointCost); // Refund points if denied
    }
  }

  const zone = currentZone();
  const zc = ZONE_CONFIG[zone];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleTheme}>
          <Text style={{ fontSize: 18 }}>🌗</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>KINGDOM OVERVIEW</Text>
        <TouchableOpacity onPress={() => router.push("/(parent)/settings")}>
          <MaterialIcons name="settings" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.childName}>{profile.name}&apos;s Quest</Text>

      {/* Zone card */}
      <View style={styles.zoneCard}>
        <Text style={styles.cardLabel}>CURRENT ZONE</Text>
        <Text style={[styles.cardValue, { color: zc.color }]}>{zc.label}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{flareLogs.length}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🪙 {points.total}</Text>
          <Text style={styles.statLabel}>Points Balance</Text>
        </View>
      </View>

      {/* Pending redemption requests */}
      {redemptions.filter((r) => r.status === "pending").length > 0 && (
        <View style={styles.redemptionSection}>
          <Text style={styles.redemptionTitle}>🎁 Prize Requests</Text>
          {redemptions
            .filter((r) => r.status === "pending")
            .map((r) => (
              <View key={r.id} style={styles.redemptionCard}>
                <View style={styles.redemptionInfo}>
                  <Text style={styles.redemptionName}>{r.prizeName}</Text>
                  <Text style={styles.redemptionCost}>
                    🪙 {r.pointCost} pts
                  </Text>
                </View>
                <View style={styles.redemptionActions}>
                  <TouchableOpacity
                    style={[
                      styles.resolveBtn,
                      { backgroundColor: Colors.background },
                    ]}
                    onPress={() => handleResolve(r, "approved")}
                  >
                    <Text style={styles.resolveBtnText}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.resolveBtn,
                      { backgroundColor: Colors.healthRed },
                    ]}
                    onPress={() => handleResolve(r, "denied")}
                  >
                    <Text style={styles.resolveBtnText}>✕ Deny</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Switch to child view */}
      <TouchableOpacity
        style={styles.childButton}
        onPress={() => router.push("/(child)/home")}
      >
        <Text style={styles.childButtonText}>START QUEST (CHILD VIEW)</Text>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>SAVE & QUIT (Sign Out)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 60,
    paddingTop: 48,
    gap: 16,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: Fonts.pixelBold,
    letterSpacing: 2,
    color: Colors.text,
  },

  childName: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  zoneCard: {
    backgroundColor: Colors.card,
    padding: 20,
    marginHorizontal: 24,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  cardLabel: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 10,
    opacity: 0.8,
  },
  cardValue: {
    fontFamily: Fonts.pixelBold,
    fontSize: 18,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginHorizontal: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  statValue: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 16,
  },
  statLabel: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 9,
    textAlign: "center",
    opacity: 0.8,
  },

  redemptionSection: {
    gap: 12,
    marginHorizontal: 24,
    marginTop: 8,
  },
  redemptionTitle: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  redemptionCard: {
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  redemptionInfo: {
    gap: 6,
  },
  redemptionName: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  redemptionCost: {
    fontFamily: Fonts.pixelBold,
    color: Colors.gold,
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  redemptionActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  resolveBtn: {
    flex: 1,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  resolveBtnText: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  childButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 24,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  childButtonText: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  signOutButton: {
    paddingVertical: 16,
    marginTop: 8,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 10,
    textDecorationLine: "underline",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
