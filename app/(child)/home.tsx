import { Colors, Fonts } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { PinVerifyModal } from "@/lib/auth/PinVerifyModal";
import type { Zone } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Assets ───────────────────────────────────────────────────────────────────

const HERO_IMAGES = {
  male: require("@/assets/images/hero-male.jpg"),
  female: require("@/assets/images/hero-female.jpg"),
  neutral: require("@/assets/images/hero-male.jpg"),
};

const ZONE_CONFIG: Record<
  Zone,
  {
    bg: string;
    border: string;
    label: string;
    emoji: string;
    questTitle: string;
  }
> = {
  green: {
    bg: "#0d2b0d",
    border: "#4ade80",
    label: "GREEN ZONE",
    emoji: "🟢",
    questTitle: "Quest Active — Controlled!",
  },
  yellow: {
    bg: "#2b2200",
    border: "#FFD700",
    label: "YELLOW ZONE",
    emoji: "🟡",
    questTitle: "Watch Out — Flare Starting!",
  },
  red: {
    bg: "#2b0000",
    border: "#ff4444",
    label: "RED ZONE",
    emoji: "🔴",
    questTitle: "DANGER — Flare Active!",
  },
};

// ─── Fallback quest steps ─────────────────────────────────────────────────────

const FALLBACK_STEPS: Record<Zone, string[]> = {
  green: [
    "Keep up your moisturising routine every day — apply your cream after every bath or shower, even when your skin feels fine.",
    "Stay cool and avoid your known triggers. Wear soft breathable fabrics and keep away from heat and sweaty environments.",
    "Drink plenty of water throughout the day. Hydrated skin heals faster and is less likely to crack or itch.",
    "Wear soft, breathable clothes today. Avoid wool or tight synthetic fabrics that can irritate your skin.",
    "Log how you are feeling to earn gold. Tracking your skin every day helps your doctor understand your patterns.",
  ],
  yellow: [
    "Apply your yellow zone cream right now — do not wait for it to get worse before using your treatment.",
    "Tell a parent your skin is acting up. They need to know early so they can help you manage it before it becomes a red zone.",
    "Avoid scratching — try pressing a cool damp cloth on the itchy area instead. Scratching breaks the skin and makes things worse.",
    "Stay out of heat and direct sun today. Hot temperatures and sweat are common triggers that make yellow zones worse.",
    "Log this flare to earn gold and help track your triggers. Every log builds a better picture for your next doctor visit.",
  ],
  red: [
    "Tell a parent or trusted adult RIGHT NOW — do not stay alone. You need someone with you to help manage this flare.",
    "Apply your red zone medication immediately. Use exactly the amount your doctor prescribed — do not skip it.",
    "Do NOT scratch — use a cold damp cloth on the worst areas instead. Scratching in red zone can cause infection.",
    "Stay calm and press the Flare-Up button below. Panicking makes itching worse — slow your breathing and stay still.",
    "Rest in a cool quiet place while help comes. Avoid heat, pets, and anything else on your known trigger list.",
  ],
};

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];
const STEP_ICONS: IconName[] = [
  "healing",
  "opacity",
  "hotel",
  "star",
  "security",
];

function shortTitle(step: string): string {
  const words = step.split(" ");
  return words.length <= 4 ? step : words.slice(0, 4).join(" ");
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChildHome() {
  const { toggleTheme } = useTheme();
  const {
    profile,
    points,
    flareLogs,
    currentZone,
    awardPoints,
    questCompletions,
    completeQuest,
  } = useAppStore();

  const [showParentPin, setShowParentPin] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<{
    index: number;
    step: string;
  } | null>(null);
  const [showAllQuests, setShowAllQuests] = useState(false);

  const zone = currentZone();
  const childName = profile?.name ?? "Hero";
  const gender = (profile?.gender ?? "neutral") as
    | "male"
    | "female"
    | "neutral";
  const steps = profile?.actionPlan
    ? profile.actionPlan[zone].childInstructions
    : FALLBACK_STEPS[zone];
  const level = Math.max(1, Math.floor(flareLogs.length / 3) + 1);
  const heroImage = HERO_IMAGES[gender];
  const completedSet = new Set(questCompletions[zone] ?? []);

  function handleComplete(index: number) {
    if (completedSet.has(index)) return;
    completeQuest(zone, index);
    awardPoints(10);
    setSelectedQuest(null);
  }

  return (
    <View style={styles.screen}>
      {/* ── Top bar — sits above the hero image ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleTheme}>
          <Text style={{ fontSize: 20 }}>🌗</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>QUEST LOG</Text>
        <View style={styles.goldBadge}>
          <Text style={styles.goldText}>🪙 {points.total}</Text>
        </View>
      </View>

      {/* ── Hero scene — full image, unobscured ── */}
      <ImageBackground
        source={heroImage}
        style={styles.heroScene}
        resizeMode="cover"
      >
        <View style={styles.nameOverlay}>
          <Text style={styles.heroName}>{childName.toUpperCase()}</Text>
          <Text style={styles.heroLevel}>LEVEL {level} FOREST GUARDIAN</Text>
        </View>
      </ImageBackground>

      {/* ── Quest section (scrollable) ── */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "transparent" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header row */}
        <View style={styles.questHeader}>
          <Text style={styles.questTitle}>ACTIVE QUESTS</Text>
          <TouchableOpacity onPress={() => setShowAllQuests(true)}>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {/* 2-column quest grid */}
        <View style={styles.questGrid}>
          {steps.map((step, i) => {
            const done = completedSet.has(i);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.questCard,
                  {
                    borderColor: done ? "#aaa" : Colors.cardBorder,
                    opacity: done ? 0.6 : 1,
                  },
                ]}
                onPress={() => setSelectedQuest({ index: i, step })}
                activeOpacity={0.75}
              >
                <View style={styles.questIconBg}>
                  <MaterialIcons
                    name={STEP_ICONS[i % STEP_ICONS.length]}
                    size={20}
                    color={done ? Colors.gold : Colors.background}
                  />
                </View>
                <Text style={styles.questText} numberOfLines={2}>
                  {shortTitle(step)}
                </Text>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: done ? Colors.gold : Colors.background,
                        width: done ? "100%" : "10%",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.questReward,
                    { color: done ? Colors.text : Colors.primary },
                  ]}
                >
                  {done ? "✓ Done" : "+10 🪙"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Parent view link */}
        <TouchableOpacity
          style={styles.parentLink}
          onPress={() => setShowParentPin(true)}
        >
          <MaterialIcons name="lock" size={14} color={Colors.text} />
          <Text style={styles.parentLinkText}>PARENT VIEW</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── FLARE-UP button (fixed footer) ── */}
      <View style={styles.flareWrapper}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => router.push("/(child)/emergency")}
          activeOpacity={0.85}
        >
          <Text style={styles.emergencyText}>🚨 MY SKIN IS BAD — GET HELP</Text>
        </TouchableOpacity>
      </View>

      {/* ── Quest detail modal ── */}
      <Modal visible={selectedQuest !== null} transparent animationType="fade">
        <Pressable
          style={styles.backdrop}
          onPress={() => setSelectedQuest(null)}
        >
          <Pressable
            style={styles.questModal}
            onPress={() => {
              /* block backdrop tap propagation */
            }}
          >
            <View style={styles.questModalIcon}>
              <MaterialIcons
                name={
                  selectedQuest
                    ? STEP_ICONS[selectedQuest.index % STEP_ICONS.length]
                    : "healing"
                }
                size={36}
                color={Colors.background}
              />
            </View>
            <Text style={styles.questModalTitle}>
              {selectedQuest ? shortTitle(selectedQuest.step) : ""}
            </Text>
            <Text style={styles.questModalDesc}>
              {selectedQuest?.step ?? ""}
            </Text>
            <TouchableOpacity
              style={[
                styles.completeBtn,
                {
                  backgroundColor:
                    selectedQuest && completedSet.has(selectedQuest.index)
                      ? "#e8ddc5"
                      : Colors.gold,
                },
              ]}
              onPress={() =>
                selectedQuest && handleComplete(selectedQuest.index)
              }
              disabled={
                selectedQuest ? completedSet.has(selectedQuest.index) : false
              }
            >
              <Text
                style={[
                  styles.completeBtnText,
                  {
                    color:
                      selectedQuest && completedSet.has(selectedQuest.index)
                        ? Colors.text
                        : "#000",
                  },
                ]}
              >
                {selectedQuest && completedSet.has(selectedQuest.index)
                  ? "✓ QUEST COMPLETED"
                  : "COMPLETE  +10 🪙"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedQuest(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── View All quests modal ── */}
      <Modal visible={showAllQuests} transparent animationType="slide">
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowAllQuests(false)}
        >
          <Pressable style={styles.allQuestsModal} onPress={() => {}}>
            <Text style={styles.allQuestsTitle}>ALL QUESTS</Text>
            <FlatList
              data={steps}
              keyExtractor={(_, i) => String(i)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const done = completedSet.has(index);
                return (
                  <TouchableOpacity
                    style={[styles.allQuestRow, { opacity: done ? 0.6 : 1 }]}
                    onPress={() => {
                      setShowAllQuests(false);
                      setSelectedQuest({ index, step: item });
                    }}
                  >
                    <View style={styles.questIconBg}>
                      <MaterialIcons
                        name={STEP_ICONS[index % STEP_ICONS.length]}
                        size={18}
                        color={done ? Colors.gold : Colors.background}
                      />
                    </View>
                    <Text style={styles.allQuestText} numberOfLines={1}>
                      {shortTitle(item)}
                    </Text>
                    {done ? (
                      <MaterialIcons
                        name="check-circle"
                        size={16}
                        color={Colors.background}
                      />
                    ) : (
                      <MaterialIcons
                        name="chevron-right"
                        size={16}
                        color={Colors.text}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              onPress={() => setShowAllQuests(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <PinVerifyModal
        visible={showParentPin}
        prompt="Enter your PIN to switch to Parent View"
        onSuccess={() => {
          setShowParentPin(false);
          router.replace("/(parent)/dashboard");
        }}
        onCancel={() => setShowParentPin(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },

  // Top bar ────────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginTop: 52,
    marginBottom: 12,
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
    fontSize: 14,
    fontFamily: Fonts.pixelBold,
    letterSpacing: 2,
    color: Colors.text,
  },
  goldBadge: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goldText: { fontFamily: Fonts.pixelBold, fontSize: 10, color: Colors.text },

  // Hero scene ─────────────────────────────────────────────────────────────────
  heroScene: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: Colors.cardBorder,
  },
  nameOverlay: {
    alignItems: "center",
    paddingBottom: 14,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  heroName: {
    fontSize: 18,
    fontFamily: Fonts.pixelBold,
    letterSpacing: 2,
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  heroLevel: {
    fontSize: 10,
    fontFamily: Fonts.pixelBold,
    letterSpacing: 1,
    color: Colors.gold,
    marginTop: 6,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  // Quest section ──────────────────────────────────────────────────────────────
  scrollContent: { paddingTop: 16, paddingBottom: 100 },

  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  questTitle: {
    fontSize: 12,
    fontFamily: Fonts.pixelBold,
    letterSpacing: 2,
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  viewAll: {
    fontSize: 10,
    fontFamily: Fonts.pixelBold,
    color: Colors.gold,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  // 2-column grid ──────────────────────────────────────────────────────────────
  questGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  questCard: {
    width: "47%",
    backgroundColor: Colors.card,
    borderWidth: 4,
    padding: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  questIconBg: {
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  questText: {
    fontSize: 15,
    fontFamily: Fonts.pixel,
    color: Colors.text,
    lineHeight: 18,
  },
  progressBg: {
    height: 6,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  progressFill: { height: "100%" },
  questReward: { fontSize: 10, fontFamily: Fonts.pixelBold },

  parentLink: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 32,
    marginTop: 20,
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  parentLinkText: {
    fontSize: 10,
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    marginLeft: 8,
  },

  // Flare button ───────────────────────────────────────────────────────────────
  flareWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
  emergencyButton: {
    backgroundColor: Colors.healthRed,
    paddingVertical: 24,
    paddingBottom: 40,
    alignItems: "center",
    borderTopWidth: 6,
    borderColor: "#000",
  },
  emergencyText: {
    color: "#fff",
    fontFamily: Fonts.pixelBold,
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  // Quest detail modal ─────────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  questModal: {
    width: "88%",
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    padding: 24,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  questModalIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  questModalTitle: {
    fontSize: 12,
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 18,
  },
  questModalDesc: {
    fontSize: 18,
    fontFamily: Fonts.pixel,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 24,
  },
  completeBtn: {
    width: "100%",
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  completeBtnText: {
    fontFamily: Fonts.pixelBold,
    fontSize: 10,
  },
  closeBtn: { paddingVertical: 12 },
  closeBtnText: {
    fontSize: 10,
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    textDecorationLine: "underline",
  },

  // View All modal ─────────────────────────────────────────────────────────────
  allQuestsModal: {
    width: "90%",
    maxHeight: "75%",
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  allQuestsTitle: {
    fontSize: 14,
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  allQuestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.cardBorder,
  },
  allQuestText: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.pixel,
    color: Colors.text,
  },
});
