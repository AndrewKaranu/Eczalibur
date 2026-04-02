import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LogScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>📝 Log a Flare</Text>
      <Text style={styles.subtitle}>Coming in Phase 8</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { color: '#FFD700', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 14 },
  back: { color: '#555', fontSize: 14, marginTop: 8 },
});
