import { StyleSheet, Text, View } from 'react-native';

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function OnboardingStep({ step, totalSteps, title, subtitle, children }: OnboardingStepProps) {
  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progress}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={[styles.dot, i < step && styles.dotDone, i === step - 1 && styles.dotActive]} />
        ))}
      </View>

      <Text style={styles.stepLabel}>STEP {step} OF {totalSteps}</Text>
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
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#4a4a6e',
  },
  dotDone: {
    backgroundColor: '#4a4a8e',
    borderColor: '#6a6aae',
  },
  dotActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    width: 24,
    borderRadius: 4,
  },
  stepLabel: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
});
