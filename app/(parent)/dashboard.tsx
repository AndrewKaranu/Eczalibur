import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ParentDashboard() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Dashboard</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>

      <TouchableOpacity
        style={styles.childButton}
        onPress={() => router.push('/(child)/home')}
      >
        <Text style={styles.childButtonText}>Switch to Child View</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c842',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  childButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  childButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton: {
    paddingVertical: 12,
  },
  signOutText: {
    color: '#888',
    fontSize: 14,
  },
});
