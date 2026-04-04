import { Colors, Fonts } from "@/constants/theme";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PIN_KEY = "eczcalibur_child_pin";
const PIN_LENGTH = 4;

interface PinGateProps {
  children: React.ReactNode;
}

// Web-safe storage fallback
async function getStoredPin(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(PIN_KEY);
  }
  return await SecureStore.getItemAsync(PIN_KEY);
}

async function setStoredPin(pin: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(PIN_KEY, pin);
    return;
  }
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export function PinGate({ children }: PinGateProps) {
  const [status, setStatus] = useState<
    "loading" | "set-pin" | "enter-pin" | "unlocked"
  >("loading");
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmPin, setConfirmPin] = useState("");
  const [settingStep, setSettingStep] = useState<"enter" | "confirm">("enter");

  useEffect(() => {
    async function checkPin() {
      const stored = await getStoredPin();
      setStatus(stored ? "enter-pin" : "set-pin");
    }
    checkPin();
  }, []);

  function handleDigit(digit: string) {
    if (status === "enter-pin") {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === PIN_LENGTH) {
        verifyPin(next);
      }
    } else if (status === "set-pin") {
      if (settingStep === "enter") {
        const next = pinInput + digit;
        setPinInput(next);
        if (next.length === PIN_LENGTH) {
          setConfirmPin(next);
          setPinInput("");
          setSettingStep("confirm");
        }
      } else {
        const next = pinInput + digit;
        setPinInput(next);
        if (next.length === PIN_LENGTH) {
          if (next === confirmPin) {
            savePin(next);
          } else {
            setError("PINs do not match. Try again.");
            setPinInput("");
            setSettingStep("enter");
            setConfirmPin("");
          }
        }
      }
    }
  }

  function handleDelete() {
    setPinInput((prev) => prev.slice(0, -1));
    setError(null);
  }

  async function verifyPin(input: string) {
    const stored = await getStoredPin();
    if (input === stored) {
      setStatus("unlocked");
    } else {
      setError("Wrong PIN. Try again.");
      setPinInput("");
    }
  }

  async function savePin(pin: string) {
    await setStoredPin(pin);
    setStatus("unlocked");
  }

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <Text
          style={{ fontFamily: Fonts.pixelBold, color: "#fff", fontSize: 16 }}
        >
          LOADING...
        </Text>
      </View>
    );
  }

  if (status === "unlocked") {
    return <>{children}</>;
  }

  const isSettingPin = status === "set-pin";
  const label = isSettingPin
    ? settingStep === "enter"
      ? "Set a 4-digit PIN for the child view"
      : "Confirm your PIN"
    : "Enter your PIN";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗡️ Eczcalibur</Text>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < pinInput.length && styles.dotFilled]}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.keypad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
          (key, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.key, !key && styles.keyEmpty]}
              onPress={() => {
                if (key === "⌫") handleDelete();
                else if (key) handleDigit(key);
              }}
              disabled={!key}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  title: {
    fontFamily: Fonts.pixelBold,
    fontSize: 24,
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  label: {
    fontFamily: Fonts.pixel,
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  dots: {
    flexDirection: "row",
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  dotFilled: {
    backgroundColor: Colors.gold,
  },
  error: {
    fontFamily: Fonts.pixelBold,
    color: Colors.healthRed,
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 260,
    gap: 16,
    justifyContent: "center",
  },
  key: {
    width: 64,
    height: 64,
    backgroundColor: Colors.card,
    borderWidth: 4,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  keyEmpty: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
  },
  keyText: {
    fontFamily: Fonts.pixelBold,
    fontSize: 24,
    color: Colors.text,
  },
});
