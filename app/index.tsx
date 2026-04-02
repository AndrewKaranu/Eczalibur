import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Parent is the only Clerk account holder.
  // Child access is PIN-gated within the parent session via /(child) routes.
  return <Redirect href="/(parent)/dashboard" />;
}
