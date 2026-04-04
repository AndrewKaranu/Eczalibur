import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import { useAppStore } from "@/store/useAppStore";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import {
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { ImageBackground } from "react-native";

SplashScreen.preventAutoHideAsync();

const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in .env");
}

function StoreHydrator() {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    VT323_400Regular,
    PressStart2P_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <ImageBackground
            source={require("../assets/images/Gemini_Generated_Image_jv79hsjv79hsjv79.png")}
            style={{ flex: 1, backgroundColor: "#5142be" }} // Dark purple baseline fallback
            imageStyle={{ resizeMode: "stretch", opacity: 0.9 }}
          >
            <NavThemeProvider value={transparentTheme}>
              <StoreHydrator />
              <Slot />
            </NavThemeProvider>
          </ImageBackground>
        </ClerkLoaded>
      </ClerkProvider>
    </AppThemeProvider>
  );
}
