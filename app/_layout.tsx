import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { ImageBackground } from 'react-native';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();

const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in .env');
}

function StoreHydrator() {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
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
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ImageBackground
          source={require('../assets/images/Gemini_Generated_Image_jv79hsjv79hsjv79.png')}
          style={{ flex: 1, backgroundColor: '#5142be' }} // Dark purple baseline fallback
          imageStyle={{ resizeMode: 'stretch', opacity: 0.9 }}
        >
          <ThemeProvider value={transparentTheme}>
            <StoreHydrator />
            <Slot />
          </ThemeProvider>
        </ImageBackground>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
