/**
 * Parent onboarding wizard — 9 steps.
 * Collects child profile → fetches weather → generates Claude action plan → prize setup.
 */

import { BodyMap } from "@/components/parent/BodyMap";
import { OnboardingStep } from "@/components/parent/OnboardingStep";
import { Colors, Fonts } from "@/constants/theme";
import type { ActionPlan, BodyArea, Medication, Prize } from "@/lib/types";
import { fetchWeather } from "@/lib/weather";
import { useAppStore } from "@/store/useAppStore";
import * as ExpoCrypto from "expo-crypto";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const TOTAL_STEPS = 9;

const COMMON_TRIGGERS = [
  "Dust mites",
  "Pet dander",
  "Pollen",
  "Sweat",
  "Heat",
  "Cold/dry air",
  "Wool/synthetic fabrics",
  "Soap/detergent",
  "Stress",
  "Certain foods",
];
const DEFAULT_PRIZES: Prize[] = [
  {
    id: "1",
    name: "Extra Screen Time",
    description: "30 min extra screen time",
    pointCost: 50,
    icon: "📱",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Choose Dinner",
    description: "Pick what's for dinner tonight",
    pointCost: 75,
    icon: "🍕",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Special Outing",
    description: "A trip to somewhere fun",
    pointCost: 200,
    icon: "🎉",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export default function OnboardingScreen() {
  const { setProfile, setActionPlan, markOnboardingComplete, setPrizes } =
    useAppStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — parent info
  const [parentName, setParentName] = useState("");
  const [parentCallName, setParentCallName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentRelationship, setParentRelationship] = useState<
    "father" | "mother" | "legal-guardian" | "other"
  >("mother");

  // Step 3 — child details
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "neutral">(
    "neutral",
  );
  const [location, setLocation] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // Step 4 — body areas (shifted due to Kelvin's new steps)
  const [selectedAreas, setSelectedAreas] = useState<BodyArea[]>([]);

  // Step 5 — medications
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", frequency: "", instructions: "" },
  ]);

  // Step 6 — triggers
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");

  // Step 7 — plan result
  const [generatedPlan, setGeneratedPlan] = useState<ActionPlan | null>(null);

  // Step 9 — prizes
  const [prizes, setLocalPrizes] = useState<Prize[]>(DEFAULT_PRIZES);

  function toggleArea(area: BodyArea) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }

  function toggleTrigger(trigger: string) {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger],
    );
  }

  function addCustomTrigger() {
    const t = customTrigger.trim();
    if (t && !selectedTriggers.includes(t)) {
      setSelectedTriggers((prev) => [...prev, t]);
      setCustomTrigger("");
    }
  }

  function addMedication() {
    setMedications((prev) => [
      ...prev,
      { name: "", frequency: "", instructions: "" },
    ]);
  }

  function updateMedication(
    index: number,
    field: keyof Medication,
    value: string,
  ) {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  }

  function removeMedication(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }

  async function generatePlan() {
    setLoading(true);
    try {
      const weather = await fetchWeather(location || "Montreal");
      const validMeds = medications.filter((m) => m.name.trim());

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: childName,
            age: parseInt(childAge, 10),
            location,
            diagnosis,
            medications: validMeds,
            triggers: selectedTriggers,
            affectedAreas: selectedAreas,
          },
          temperature: weather.temperature,
          humidity: weather.humidity,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = (await res.json()) as { plan: ActionPlan };
      setGeneratedPlan(data.plan);
      setStep(8);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      Alert.alert(
        "Plan generation failed",
        msg + "\n\nYou can continue and generate the plan later.",
      );
      setStep(8);
    } finally {
      setLoading(false);
    }
  }

  async function finishOnboarding() {
    setLoading(true);
    try {
      const profileId = ExpoCrypto.randomUUID();
      const now = new Date().toISOString();

      await setProfile({
        id: profileId,
        parentName: parentName.trim(),
        parentCallName: parentCallName.trim() || parentName.trim(),
        parentRelationship,
        parentPhone: parentPhone.trim() || undefined,
        name: childName,
        age: parseInt(childAge, 10) || 10,
        gender,
        location,
        diagnosis,
        medications: medications.filter((m) => m.name.trim()),
        triggers: selectedTriggers,
        affectedAreas: selectedAreas,
        actionPlan: generatedPlan,
        onboardingComplete: true,
        createdAt: now,
        updatedAt: now,
      });

      if (generatedPlan) {
        await setActionPlan(generatedPlan);
      }

      await setPrizes(prizes);
      await markOnboardingComplete();

      router.replace("/(parent)/dashboard");
    } catch (err) {
      Alert.alert("Error", "Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (step === 7) {
      generatePlan();
    } else if (step === TOTAL_STEPS) {
      finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  }

  function prevStep() {
    if (step > 1) setStep((s) => s - 1);
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return parentName.trim().length > 0 && parentPhone.trim().length >= 7;
      case 2:
        return true;
      case 3:
        return childName.trim().length > 0 && childAge.trim().length > 0;
      case 4:
        return selectedAreas.length > 0;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return !loading;
      case 8:
        return true;
      case 9:
        return true;
      default:
        return true;
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Step 1: Parent info ── */}
        {step === 1 && (
          <OnboardingStep
            step={1}
            totalSteps={TOTAL_STEPS}
            title="About you"
            subtitle="This helps personalise the experience for your child."
          >
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={parentName}
              onChangeText={setParentName}
              placeholder="E.g. Sarah"
              placeholderTextColor="#555"
              autoCapitalize="words"
            />

            <Text style={styles.label}>What should your child call you?</Text>
            <TextInput
              style={styles.input}
              value={parentCallName}
              onChangeText={setParentCallName}
              placeholder="E.g. Mom, Dad, Papa (leave blank to use your name)"
              placeholderTextColor="#555"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Your phone number</Text>
            <TextInput
              style={styles.input}
              value={parentPhone}
              onChangeText={setParentPhone}
              placeholder="E.g. +1 514 555 0100"
              placeholderTextColor="#555"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Text style={[styles.hint, { marginTop: -12, marginBottom: 16 }]}>
              Shown on the emergency screen so your child can call you
              instantly.
            </Text>

            <Text style={styles.label}>Relationship</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {(
                [
                  ["father", "Father"],
                  ["mother", "Mother"],
                  ["legal-guardian", "Legal Guardian"],
                  ["other", "Other"],
                ] as const
              ).map(([val, label]) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.genderPill,
                    parentRelationship === val && {
                      borderColor: "#fff",
                      backgroundColor: Colors.gold,
                    },
                  ]}
                  onPress={() => setParentRelationship(val)}
                >
                  <Text
                    style={[
                      styles.genderPillText,
                      parentRelationship === val && { color: "#000" },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </OnboardingStep>
        )}

        {/* ── Step 2: Welcome & consent ── */}
        {step === 2 && (
          <OnboardingStep
            step={2}
            totalSteps={TOTAL_STEPS}
            title="Welcome to Eczcalibur"
            subtitle="Let's set up your child's personalised eczema action plan."
          >
            <View style={styles.consentBox}>
              <Text style={styles.consentTitle}>📋 Before we begin</Text>
              <Text style={styles.consentText}>
                • This app helps manage your child&apos;s eczema using a Written
                Action Plan generated with AI assistance.
              </Text>
              <Text style={styles.consentText}>
                • Eczcalibur is a support tool — it does not replace your
                dermatologist&apos;s advice.
              </Text>
              <Text style={styles.consentText}>
                • Claude AI will process your child&apos;s profile to generate
                zone-based instructions. Data is sent only when you take action.
              </Text>
              <Text style={styles.consentText}>
                • You can update or delete your child&apos;s profile at any
                time.
              </Text>
            </View>
            <View style={styles.consentBox}>
              <Text style={styles.consentTitle}>🔒 Privacy &amp; Data</Text>
              <Text style={styles.consentText}>
                All profile and log data is stored locally on your device only —
                we have no server database.
              </Text>
              <Text style={styles.consentText}>
                When you generate a plan, send a chat message, or create an
                appointment summary, your child's profile data is transmitted to
                Anthropic's API to generate the response. It is not stored by us
                on any server. By continuing, you consent to this on behalf of
                your child.
              </Text>
              <Text style={styles.consentText}>
                This app is intended for use by a parent or legal guardian. If
                your child is under 13, please ensure you have reviewed
                Anthropic's privacy policy before proceeding.
              </Text>
            </View>
          </OnboardingStep>
        )}

        {/* ── Step 3: Child details ── */}
        {step === 3 && (
          <OnboardingStep
            step={3}
            totalSteps={TOTAL_STEPS}
            title="About your child"
            subtitle="This info personalises the action plan."
          >
            <Text style={styles.label}>Child&apos;s first name</Text>
            <TextInput
              style={styles.input}
              value={childName}
              onChangeText={setChildName}
              placeholder="E.g. Alex"
              placeholderTextColor="#555"
            />

            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              value={childAge}
              onChangeText={setChildAge}
              placeholder="E.g. 9"
              placeholderTextColor="#555"
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={styles.label}>Hero Type</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {(
                [
                  ["male", "🧝‍♂️ Boy"],
                  ["female", "🧝‍♀️ Girl"],
                  ["neutral", "🧙 Other"],
                ] as const
              ).map(([val, label]) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.genderPill,
                    gender === val && {
                      borderColor: "#fff",
                      backgroundColor: Colors.gold,
                    },
                  ]}
                  onPress={() => setGender(val)}
                >
                  <Text
                    style={[
                      styles.genderPillText,
                      gender === val && { color: "#000" },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>City / Region</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="E.g. Montreal"
              placeholderTextColor="#555"
            />

            <Text style={styles.label}>Diagnosis</Text>
            <TextInput
              style={styles.input}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="E.g. Atopic dermatitis, moderate"
              placeholderTextColor="#555"
            />
          </OnboardingStep>
        )}

        {/* ── Step 4: Body areas ── */}
        {step === 4 && (
          <OnboardingStep
            step={4}
            totalSteps={TOTAL_STEPS}
            title="Affected areas"
            subtitle="Tap the body map or labels to mark where eczema appears."
          >
            <BodyMap selected={selectedAreas} onToggle={toggleArea} />
          </OnboardingStep>
        )}

        {/* ── Step 5: Medications ── */}
        {step === 5 && (
          <OnboardingStep
            step={5}
            totalSteps={TOTAL_STEPS}
            title="Medications"
            subtitle="Enter current prescribed treatments. Tap + to add more."
          >
            {medications.map((med, i) => (
              <View key={i} style={styles.medCard}>
                <View style={styles.medHeader}>
                  <Text style={styles.medTitle}>Medication {i + 1}</Text>
                  {medications.length > 1 && (
                    <TouchableOpacity onPress={() => removeMedication(i)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  value={med.name}
                  onChangeText={(v) => updateMedication(i, "name", v)}
                  placeholder="Name (e.g. Hydrocortisone 1%)"
                  placeholderTextColor="#555"
                />
                <TextInput
                  style={styles.input}
                  value={med.frequency}
                  onChangeText={(v) => updateMedication(i, "frequency", v)}
                  placeholder="Frequency (e.g. Twice daily)"
                  placeholderTextColor="#555"
                />
                <TextInput
                  style={styles.input}
                  value={med.instructions}
                  onChangeText={(v) => updateMedication(i, "instructions", v)}
                  placeholder="Instructions (e.g. Thin layer to affected areas)"
                  placeholderTextColor="#555"
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addMedication}>
              <Text style={styles.addButtonText}>+ Add medication</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              No medications yet? Leave blank and add later from the dashboard.
            </Text>
          </OnboardingStep>
        )}

        {/* ── Step 6: Triggers ── */}
        {step === 6 && (
          <OnboardingStep
            step={6}
            totalSteps={TOTAL_STEPS}
            title="Known triggers"
            subtitle="Select anything that tends to cause flares."
          >
            <View style={styles.chipGrid}>
              {COMMON_TRIGGERS.map((t) => (
                <Pressable
                  key={t}
                  style={[
                    styles.chip,
                    selectedTriggers.includes(t) && styles.chipSelected,
                  ]}
                  onPress={() => toggleTrigger(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTriggers.includes(t) && styles.chipTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.customTriggerRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={customTrigger}
                onChangeText={setCustomTrigger}
                placeholder="Add custom trigger"
                placeholderTextColor="#555"
                onSubmitEditing={addCustomTrigger}
              />
              <TouchableOpacity
                style={styles.addInlineButton}
                onPress={addCustomTrigger}
              >
                <Text style={styles.addInlineText}>Add</Text>
              </TouchableOpacity>
            </View>
            {selectedTriggers
              .filter((t) => !COMMON_TRIGGERS.includes(t))
              .map((t) => (
                <Text key={t} style={styles.customTriggerTag}>
                  ✓ {t}
                </Text>
              ))}
          </OnboardingStep>
        )}

        {/* ── Step 7: Generate plan ── */}
        {step === 7 && (
          <OnboardingStep
            step={7}
            totalSteps={TOTAL_STEPS}
            title="Generating your plan"
            subtitle="Claude AI is creating a personalised 3-zone action plan."
          >
            <View style={styles.generateBox}>
              <Text style={styles.generateIcon}>⚔️</Text>
              <Text style={styles.generateTitle}>
                Ready to forge {childName}'s action plan
              </Text>
              <Text style={styles.generateText}>
                This will use your child's profile and current weather data to
                create Green, Yellow, and Red zone instructions.
              </Text>
              <Text style={styles.generateDisclaimer}>
                Remember: this plan is a starting point. Review it with your
                dermatologist before using.
              </Text>
              {loading && (
                <Text style={styles.loadingText}>CASTING SPELL...</Text>
              )}
              {loading && (
                <Text style={styles.loadingText}>
                  Consulting the AI wizard...
                </Text>
              )}
            </View>
          </OnboardingStep>
        )}

        {/* ── Step 8: Plan review ── */}
        {step === 8 && (
          <OnboardingStep
            step={8}
            totalSteps={TOTAL_STEPS}
            title="Review your plan"
            subtitle="Your 3-zone action plan is ready. Review before approving."
          >
            {generatedPlan ? (
              <>
                {(["green", "yellow", "red"] as const).map((zone) => {
                  const zoneData = generatedPlan[zone];
                  const colors = {
                    green: "#2d5a27",
                    yellow: "#5a4a10",
                    red: "#5a1a1a",
                  };
                  const borders = {
                    green: "#4ade80",
                    yellow: "#FFD700",
                    red: "#ff6b6b",
                  };
                  return (
                    <View
                      key={zone}
                      style={[
                        styles.zoneCard,
                        {
                          borderColor: borders[zone],
                          backgroundColor: colors[zone],
                        },
                      ]}
                    >
                      <Text
                        style={[styles.zoneTitle, { color: borders[zone] }]}
                      >
                        {zoneData.icon} {zone.toUpperCase()} ZONE
                      </Text>
                      {zoneData.parentInstructions.map((inst, i) => (
                        <Text key={i} style={styles.zoneInstruction}>
                          • {inst}
                        </Text>
                      ))}
                    </View>
                  );
                })}
                <Text style={styles.hint}>
                  You can edit this plan from the dashboard at any time.
                </Text>
              </>
            ) : (
              <View style={styles.generateBox}>
                <Text style={styles.generateIcon}>⚠️</Text>
                <Text style={styles.generateText}>
                  Plan generation was skipped or failed. You can generate the
                  plan from the dashboard after completing setup.
                </Text>
              </View>
            )}
          </OnboardingStep>
        )}

        {/* ── Step 9: Prize setup ── */}
        {step === 9 && (
          <OnboardingStep
            step={9}
            totalSteps={TOTAL_STEPS}
            title="Set up prizes"
            subtitle="Children earn points for logging flares. What can they redeem?"
          >
            {prizes.map((prize, i) => (
              <View key={prize.id} style={styles.prizeCard}>
                <Text style={styles.prizeIcon}>{prize.icon}</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.prizeInput}
                    value={prize.name}
                    onChangeText={(v) =>
                      setLocalPrizes((prev) =>
                        prev.map((p, idx) =>
                          idx === i ? { ...p, name: v } : p,
                        ),
                      )
                    }
                    placeholder="Prize name"
                    placeholderTextColor="#555"
                  />
                  <Text style={styles.prizeCost}>{prize.pointCost} points</Text>
                </View>
              </View>
            ))}
            <Text style={styles.hint}>
              You can add, edit, or remove prizes from the dashboard at any
              time.
            </Text>
          </OnboardingStep>
        )}

        {/* ── Navigation buttons ── */}
        <View style={styles.navRow}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={prevStep}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
              step === 1 && { flex: 1 },
            ]}
            onPress={nextStep}
            disabled={!canProceed() || loading}
          >
            {loading && (step === 7 || step === TOTAL_STEPS) ? (
              <Text style={{ fontFamily: Fonts.pixelBold, color: "#fff" }}>
                ...
              </Text>
            ) : (
              <Text style={styles.nextButtonText}>
                {step === TOTAL_STEPS
                  ? "✓ Finish Setup"
                  : step === 7
                    ? "⚔️ Generate Plan"
                    : "Continue →"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  label: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 10,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#e8ddc5",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 20,
    fontFamily: Fonts.pixel,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    marginBottom: 4,
  },
  hint: {
    fontFamily: Fonts.pixel,
    color: Colors.text,
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
    opacity: 0.8,
  },
  // Consent
  consentBox: {
    backgroundColor: Colors.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  consentTitle: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 12,
    marginBottom: 16,
  },
  consentText: {
    fontFamily: Fonts.pixel,
    color: Colors.text,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  // Chips
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.cardBorder,
  },
  chipSelected: { backgroundColor: Colors.gold, borderColor: "#fff" },
  chipText: { fontFamily: Fonts.pixel, color: Colors.text, fontSize: 18 },
  chipTextSelected: {
    fontFamily: Fonts.pixelBold,
    color: "#000",
    fontSize: 10,
  },
  // Medications
  medCard: {
    backgroundColor: Colors.card,
    padding: 14,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  medHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  medTitle: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 10 },
  removeText: {
    fontFamily: Fonts.pixelBold,
    color: Colors.healthRed,
    fontSize: 10,
  },
  addButton: {
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  addButtonText: { fontFamily: Fonts.pixelBold, color: "#000", fontSize: 12 },
  // Triggers
  customTriggerRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    alignItems: "center",
  },
  addInlineButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  addInlineText: { fontFamily: Fonts.pixelBold, color: "#000", fontSize: 12 },
  customTriggerTag: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 10,
    marginTop: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Generate
  generateBox: {
    alignItems: "center",
    padding: 24,
    gap: 16,
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  generateIcon: { fontSize: 48 },
  generateTitle: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  generateText: {
    fontFamily: Fonts.pixel,
    color: Colors.text,
    fontSize: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  generateDisclaimer: {
    fontFamily: Fonts.pixel,
    color: Colors.text,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    borderTopWidth: 2,
    borderColor: Colors.cardBorder,
    paddingTop: 16,
  },
  loadingText: {
    fontFamily: Fonts.pixel,
    color: Colors.text,
    fontSize: 20,
    marginTop: 8,
  },
  // Plan zones
  zoneCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  zoneTitle: {
    fontFamily: Fonts.pixelBold,
    fontSize: 12,
    marginBottom: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  zoneInstruction: {
    fontFamily: Fonts.pixel,
    color: "#fff",
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Prizes
  prizeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    padding: 14,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  prizeIcon: { fontSize: 32 },
  prizeInput: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.pixel,
    borderBottomWidth: 2,
    borderColor: Colors.cardBorder,
    paddingBottom: 4,
    marginBottom: 8,
  },
  prizeCost: { fontFamily: Fonts.pixelBold, color: Colors.text, fontSize: 10 },
  // Gender/Relationship picker
  genderPill: {
    flex: 1,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  genderPillText: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 10,
  },
  // Nav
  navRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  backButtonText: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 10,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  nextButtonDisabled: { backgroundColor: "#888", shadowOpacity: 0 },
  nextButtonText: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
