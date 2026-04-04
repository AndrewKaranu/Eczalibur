import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import type { ChatMessage } from '@/lib/types';
import { Colors, Fonts } from '@/constants/theme';

export default function ChatScreen() {
  const { isHydrated, profile, flareLogs } = useAppStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      if (!profile) throw new Error('No profile loaded');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          recentLogs: flareLogs.slice(-30),
          profile: {
            name: profile.name,
            age: profile.age,
            diagnosis: profile.diagnosis,
            medications: profile.medications,
            triggers: profile.triggers,
          },
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Something went wrong. Please check your connection and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CAVE MAGE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.disclosureBanner}>
        <Text style={styles.disclosureText}>
          🔒 Your data is shared with the AI Mage only for this conversation. Not stored on any server.
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              Ask the Mage anything about{'\n'}
              {profile?.name ?? 'your child'}&apos;s eczema management.
            </Text>
            <Text style={styles.emptyChatHint}>
              Try: &quot;Why might she flare more on weekends?&quot;
            </Text>
          </View>
        }
        contentContainerStyle={
          messages.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.gold} size="small" />
          <Text style={styles.loadingText}>Mage is thinking…</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.textInput, loading && styles.inputDisabled]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          placeholderTextColor="#666"
          multiline
          editable={!loading}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  loadingScreen: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 10 },
  title: { flex: 1, fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 16, textAlign: 'center', textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 0 },
  headerSpacer: { width: 48 },
  
  disclosureBanner: { backgroundColor: 'rgba(0,0,0,0.5)', borderBottomWidth: 4, borderColor: Colors.cardBorder, paddingHorizontal: 20, paddingVertical: 10 },
  disclosureText: { fontFamily: Fonts.pixel, color: '#ccc', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  
  messageList: { flex: 1 },
  listContent: { paddingVertical: 12 },
  emptyContainer: { flex: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 60, gap: 12 },
  emptyChatText: { fontFamily: Fonts.pixel, color: '#fff', fontSize: 24, textAlign: 'center', lineHeight: 32, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
  emptyChatHint: { fontFamily: Fonts.pixel, color: Colors.gold, fontSize: 16, textAlign: 'center', lineHeight: 22, marginTop: 12 },
  
  bubble: { maxWidth: '80%', padding: 16, marginVertical: 8, marginHorizontal: 16, borderWidth: 4, shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  userBubble: { backgroundColor: Colors.gold, borderColor: '#fff', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: Colors.card, borderColor: Colors.cardBorder, alignSelf: 'flex-start' },
  
  bubbleText: { fontSize: 18, lineHeight: 26 },
  userBubbleText: { fontFamily: Fonts.pixel, color: '#000' },
  assistantBubbleText: { fontFamily: Fonts.pixel, color: Colors.text },

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { fontFamily: Fonts.pixelBold, color: Colors.gold, fontSize: 10 },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 4, borderColor: Colors.cardBorder, backgroundColor: Colors.card },
  textInput: { flex: 1, backgroundColor: '#e8ddc5', borderWidth: 4, borderColor: Colors.cardBorder, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, fontFamily: Fonts.pixel, fontSize: 20, color: Colors.text, maxHeight: 120 },
  inputDisabled: { opacity: 0.7 },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOffset: {width: 4, height: 4}, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  sendBtnDisabled: { backgroundColor: '#888', borderColor: '#444', shadowOpacity: 0 },
  sendBtnText: { fontFamily: Fonts.pixelBold, color: '#fff', fontSize: 12, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 0 },
});
