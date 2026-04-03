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
        <ActivityIndicator color="#FFD700" size="large" />
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
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Claude Chat</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Privacy banner */}
      <View style={styles.disclosureBanner}>
        <Text style={styles.disclosureText}>
          🔒 Your data is shared with Claude only for this conversation. Not stored on any server.
        </Text>
      </View>

      {/* Message list */}
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
              Ask Claude anything about{'\n'}
              {profile?.name ?? 'your child'}'s eczema management.
            </Text>
            <Text style={styles.emptyChatHint}>
              Try: "Why might she flare more on weekends?" or "What should I ask at the next appointment?"
            </Text>
          </View>
        }
        contentContainerStyle={
          messages.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#FFD700" size="small" />
          <Text style={styles.loadingText}>Claude is thinking…</Text>
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.textInput, loading && styles.inputDisabled]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          placeholderTextColor="#555"
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
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { color: '#FFD700', fontSize: 15, fontWeight: '600' },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: { width: 48 },
  disclosureBanner: {
    backgroundColor: '#1e1e35',
    borderBottomWidth: 1,
    borderColor: '#3a3a5e',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disclosureText: { color: '#888', fontSize: 11, lineHeight: 16 },
  messageList: { flex: 1 },
  listContent: { paddingVertical: 12 },
  emptyContainer: { flex: 1 },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 12,
  },
  emptyChatText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  emptyChatHint: {
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userBubble: {
    backgroundColor: '#FFD700',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#2a2a3e',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: '#1a1a2e', fontWeight: '600' },
  assistantBubbleText: { color: '#fff' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingText: { color: '#aaa', fontSize: 13, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderColor: '#3a3a5e',
    backgroundColor: '#1a1a2e',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3a3a5e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 120,
  },
  inputDisabled: { opacity: 0.5 },
  sendBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendBtnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 14 },
});
