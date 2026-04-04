import { Colors, Fonts } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function OnboardingStep({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: OnboardingStepProps) {
  return (
    <View style={styles.container}>
      {/* Progress pixels */}
      <View style={styles.progress}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < step && styles.dotDone,
              i === step - 1 && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.stepLabel}>
        STEP {step} OF {totalSteps}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  progress: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: Colors.cardBorder,
    borderWidth: 2,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  dotDone: {
    backgroundColor: Colors.primary,
  },
  dotActive: {
    backgroundColor: Colors.gold,
    width: 16,
    height: 16,
  },
  stepLabel: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  title: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: Fonts.pixel,
    color: "#ddd",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  content: {
    flex: 1,
  },
});
