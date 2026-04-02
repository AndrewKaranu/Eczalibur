import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChildHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗡️ Eczcalibur</Text>
      <Text style={styles.subtitle}>Child Home — Coming soon</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(parent)/dashboard')}>
        <Text style={styles.backText}>Back to Parent View</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2e1a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f5c842',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2a4a2a',
    borderRadius: 12,
    marginTop: 16,
  },
  backText: {
    color: '#aaa',
    fontSize: 14,
  },
});
