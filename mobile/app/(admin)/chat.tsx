import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { mockMessages, mockClients } from '../../utils/mockData';
import { Message } from '../../types';
import { format, parseISO } from 'date-fns';

export default function ChatScreen() {
  const { conversationId, clientId } = useLocalSearchParams<{
    conversationId: string;
    clientId: string;
  }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const listRef = useRef<FlatList>(null);

  const client = mockClients.find((c) => c.id === clientId);
  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId || 'conv-001',
      senderId: user?.id || 'admin-001',
      receiverId: clientId || 'client-001',
      content: message.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const isMyMessage = (senderId: string) =>
    senderId === user?.id || senderId === 'admin-001';

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = isMyMessage(item.senderId);
    const showDate =
      index === 0 ||
      format(parseISO(messages[index - 1].createdAt), 'dd MMM') !==
        format(parseISO(item.createdAt), 'dd MMM');

    return (
      <>
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>
              {format(parseISO(item.createdAt), 'dd MMM yyyy')}
            </Text>
            <View style={styles.dateLine} />
          </View>
        )}
        <View style={[styles.messageBubbleWrapper, isMe && styles.myWrapper]}>
          {!isMe && (
            <AppAvatar
              name={clientName}
              size="xs"
              uri={client?.avatar}
              style={styles.bubbleAvatar}
            />
          )}
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
            {item.content && (
              <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>
                {item.content}
              </Text>
            )}
            <View style={styles.bubbleMeta}>
              <Text style={[styles.bubbleTime, isMe && styles.myBubbleTime]}>
                {format(parseISO(item.createdAt), 'hh:mm a')}
              </Text>
              {isMe && (
                <MaterialIcons
                  name={item.readAt ? 'done-all' : 'done'}
                  size={12}
                  color={item.readAt ? Colors.secondary : 'rgba(255,255,255,0.6)'}
                />
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <AppAvatar name={clientName} size="sm" uri={client?.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{clientName}</Text>
          <Text style={styles.headerStatus}>{client?.clientProfile?.firmName || 'Online'}</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <MaterialIcons name="more-vert" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <MaterialIcons name="attach-file" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, message.trim() && styles.sendBtnActive]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={message.trim() ? Colors.textLight : Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  headerAction: { padding: 4 },
  messageList: {
    padding: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dateText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    maxWidth: '80%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  bubbleAvatar: { marginBottom: 2 },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    maxWidth: 280,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  myBubbleText: { color: Colors.textLight },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  bubbleTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  myBubbleTime: { color: 'rgba(255,255,255,0.6)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs + 2 : 0,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
  },
});
