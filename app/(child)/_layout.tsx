import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Slot } from 'expo-router';
import { PinGate } from '@/lib/auth/PinGate';

export default function ChildLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <PinGate>
      <Slot />
    </PinGate>
  );
}
