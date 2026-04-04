import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"credentials" | "otp" | "otp2">(
    "credentials",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else if (result.status === "needs_first_factor") {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
        } as Parameters<typeof signIn.prepareFirstFactor>[0]);
        setStage("otp");
      } else if (result.status === "needs_second_factor") {
        // Pick the first available second factor strategy
        const supported = result.supportedSecondFactors ?? [];
        const factor = supported[0];
        if (!factor) {
          setError(
            "2FA is required but no method is enrolled. Disable MFA enforcement in your Clerk dashboard.",
          );
          return;
        }
        if (factor.strategy === "totp") {
          // TOTP doesn't need prepare — just show input
        } else {
          await signIn.prepareSecondFactor({
            strategy: factor.strategy,
          } as Parameters<typeof signIn.prepareSecondFactor>[0]);
        }
        setStage("otp2");
      } else {
        setError(`Unexpected status: ${result.status}. Contact support.`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Sign-in failed. Check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp2() {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const supported = signIn.supportedSecondFactors ?? [];
      const strategy = (supported[0]?.strategy ?? "totp") as Parameters<
        typeof signIn.attemptSecondFactor
      >[0]["strategy"];
      const result = await signIn.attemptSecondFactor({
        strategy,
        code: otp.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setError("2FA verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid 2FA code. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp() {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otp.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>ECZCALIBUR</Text>

        {stage === "credentials" ? (
          <>
            <Text style={styles.subtitle}>START YOUR QUEST</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#7a5b42"
                autoCapitalize="none"
                keyboardType="default"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#7a5b42"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.buttonText}>LOADING...</Text>
              ) : (
                <Text style={styles.buttonText}>ENTER</Text>
              )}
            </TouchableOpacity>
          </>
        ) : stage === "otp" ? (
          <>
            <Text style={styles.subtitle}>A SCROLL HAS BEEN SENT</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="6-digit seal"
                placeholderTextColor="#7a5b42"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleOtp}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.buttonText}>VERIFYING...</Text>
              ) : (
                <Text style={styles.buttonText}>BREAK SEAL</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStage("credentials");
                setError(null);
                setOtp("");
              }}
            >
              <Text style={styles.backLink}>← RETURN</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>TWO-FACTOR GUARD</Text>
            <Text style={styles.hint}>(Hint: use code 424242)</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="Auth code"
                placeholderTextColor="#7a5b42"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleOtp2}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.buttonText}>VERIFYING...</Text>
              ) : (
                <Text style={styles.buttonText}>VERIFY</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStage("credentials");
                setError(null);
                setOtp("");
              }}
            >
              <Text style={styles.backLink}>← RETURN</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  title: {
    fontFamily: Fonts.pixelBold,
    fontSize: 32,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#ffffff",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: Fonts.pixelBold,
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.card,
    padding: 16,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  input: {
    height: 48,
    backgroundColor: "#e8ddc5",
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 24,
    fontFamily: Fonts.pixel,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  error: {
    fontFamily: Fonts.pixel,
    color: Colors.healthRed,
    fontSize: 20,
    textAlign: "center",
  },
  button: {
    height: 56,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontFamily: Fonts.pixelBold,
    color: "#fff",
    fontSize: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  backLink: {
    fontFamily: Fonts.pixelBold,
    color: Colors.text,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  hint: {
    fontFamily: Fonts.pixel,
    color: Colors.text,
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
  },
});
