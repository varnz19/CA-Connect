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
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Message } from '../../types';
import { format, parseISO } from 'date-fns';
import { useClient, useMessages, useConversations } from '../../hooks/useQueries';
import { useMutation } from '@tanstack/react-query';
import { messageService } from '../../services/messageService';
import { socketService } from '../../services/socketService';

export default function ChatScreen() {
  const { conversationId: paramConvId, clientId } = useLocalSearchParams<{
    conversationId: string;
    clientId: string;
  }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList>(null);

  const { data: convsRes } = useConversations();
  const [createdConvId, setCreatedConvId] = useState<string>('');

  const matchedConv = convsRes?.data?.find(
    (c: any) =>
      c.clientProfile?.userId === clientId ||
      c.client?.id === clientId ||
      c.clientProfile?.user?.id === clientId ||
      c.clientProfileId === clientId
  );

  useEffect(() => {
    if (!paramConvId && !matchedConv?.id && clientId) {
      messageService.getOrCreateClientConversation(clientId).then((res) => {
        if (res?.data?.id) {
          setCreatedConvId(res.data.id);
        }
      }).catch(() => {});
    }
  }, [paramConvId, matchedConv?.id, clientId]);

  const activeConvId = paramConvId || matchedConv?.id || createdConvId || '';

  const { data: clientRes } = useClient(clientId || matchedConv?.clientProfile?.user?.id || '');
  const clientUser = clientRes?.data || matchedConv?.clientProfile?.user || matchedConv?.client;
  const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : 'Client';
  const firmName = clientRes?.data?.clientProfile?.firmName || matchedConv?.clientProfile?.firmName;

  const { data: messagesRes, refetch } = useMessages(activeConvId);

  useEffect(() => {
    if (messagesRes?.data) {
      setMessages(messagesRes.data);
    }
  }, [messagesRes?.data]);

  useEffect(() => {
    if (!activeConvId) return;

    socketService.joinConversation(activeConvId);

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
  }, [activeConvId]);

  const sendMutation = useMutation({
    mutationFn: messageService.sendMessage,
    onSuccess: () => {
      setMessage('');
      refetch();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const sendMessage = () => {
    const targetReceiverId = clientId || clientUser?.id;
    if (!message.trim() || !activeConvId || !targetReceiverId) return;

    sendMutation.mutate({
      conversationId: activeConvId,
      receiverId: targetReceiverId,
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

        {/* Clean, generic message block */}
        <View style={[styles.messageBlock, isMe ? styles.myBlock : styles.theirBlock]}>
          <View style={styles.metaHeader}>
            <Text style={styles.senderName}>{isMe ? 'You' : clientName}</Text>
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
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfile}
          onPress={() => {
            if (clientId || clientUser?.id) {
              router.push(`/(admin)/client-detail?id=${clientId || clientUser?.id}` as any);
            }
          }}
          activeOpacity={0.7}
        >
          <AppAvatar name={clientName} size="sm" uri={clientUser?.avatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{clientName}</Text>
            <Text style={styles.headerSub}>
              {firmName ? `${firmName} · Tap for profile` : 'Tap to view profile'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileQuickLink}
          onPress={() => {
            if (clientId || clientUser?.id) {
              router.push(`/(admin)/client-detail?id=${clientId || clientUser?.id}` as any);
            }
          }}
        >
          <MaterialIcons name="info-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
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
              <Text style={styles.emptyTitle}>Direct Messages</Text>
              <Text style={styles.emptyText}>
                No messages yet. Send a note to start the conversation with {clientName}.
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
  backBtn: { padding: 4 },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  profileQuickLink: {
    padding: 6,
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
