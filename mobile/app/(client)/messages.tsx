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
import { MaterialIcons } from '@expo/vector-icons';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Message } from '../../types';
import { format, parseISO } from 'date-fns';
import { useConversations, useMessages } from '../../hooks/useQueries';
import { useMutation } from '@tanstack/react-query';
import { messageService } from '../../services/messageService';
import { socketService } from '../../services/socketService';

export default function ClientMessagesScreen() {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList>(null);

  const { data: conversationsRes } = useConversations();
  const conversation = conversationsRes?.data?.[0];
  const conversationId = conversation?.id;

  const { data: messagesRes, refetch } = useMessages(conversationId || '');

  useEffect(() => {
    if (messagesRes?.data) {
      setMessages(messagesRes.data);
    }
  }, [messagesRes?.data]);

  useEffect(() => {
    if (!conversationId) return;

    socketService.joinConversation(conversationId);

    const handleReceive = (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const cleanup = socketService.onReceiveMessage(handleReceive);

    return () => {
      cleanup();
    };
  }, [conversationId]);

  const sendMutation = useMutation({
    mutationFn: messageService.sendMessage,
    onSuccess: () => {
      setMessage('');
      refetch();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const sendMessage = () => {
    if (!message.trim() || !conversationId) return;
    const receiverId = conversation?.clientProfile?.adminId || 'admin-user-id';

    sendMutation.mutate({
      conversationId,
      receiverId,
      content: message.trim(),
    });
  };

  const isMyMessage = (senderId: string) => senderId === user?.id;

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = isMyMessage(item.senderId);
    const showDate =
      index === 0 ||
      format(parseISO(messages[index - 1].createdAt), 'dd MMM') !==
        format(parseISO(item.createdAt), 'dd MMM');

    return (
      <View style={styles.messageEntry}>
        {showDate && (
          <View style={styles.daySeparator}>
            <View style={styles.dayLine} />
            <Text style={styles.dayText}>
              {format(parseISO(item.createdAt), 'dd MMMM yyyy').toUpperCase()}
            </Text>
            <View style={styles.dayLine} />
          </View>
        )}

        <View style={[styles.messageBlock, isMe ? styles.myBlock : styles.theirBlock]}>
          <View style={styles.metaHeader}>
            <Text style={styles.senderName}>{isMe ? 'You' : 'Accountant'}</Text>
            <Text style={styles.timestampMono}>
              {format(parseISO(item.createdAt), 'hh:mm a')}
            </Text>
            {isMe && (
              <Text style={styles.statusMono}>
                {item.readAt ? '· Read' : '· Sent'}
              </Text>
            )}
          </View>

          <View style={[styles.contentCard, isMe ? styles.myContent : styles.theirContent]}>
            <Text style={[styles.contentText, isMe && styles.myContentText]}>
              {item.content}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Generic, clean header */}
      <View style={styles.header}>
        <AppAvatar name="CA Firm" size="sm" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Chartered Accountant</Text>
          <Text style={styles.headerSub}>Active chat</Text>
        </View>
      </View>

      <View style={styles.hairlineRule} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Messages</Text>
              <Text style={styles.emptyText}>
                Need help with taxes, filings, or invoices? Type a message below to consult your CA.
              </Text>
            </View>
          }
        />

        {/* Clean, generic input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendBtnText}>Send</Text>
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
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  messageList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  messageEntry: {
    marginBottom: Spacing.md,
  },
  daySeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  dayLine: { flex: 1, height: 1, backgroundColor: Colors.hairline },
  dayText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  messageBlock: {
    maxWidth: '85%',
  },
  myBlock: {
    alignSelf: 'flex-end',
  },
  theirBlock: {
    alignSelf: 'flex-start',
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  senderName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  timestampMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  statusMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.secondaryDark,
  },
  contentCard: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 4,
    borderWidth: 1,
  },
  myContent: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.border,
  },
  theirContent: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.hairline,
  },
  contentText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    lineHeight: 20,
  },
  myContentText: {
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 60,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    minHeight: 40,
    maxHeight: 90,
    paddingVertical: 6,
  },
  sendBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textLight,
  },
});
