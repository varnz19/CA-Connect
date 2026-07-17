import React, { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Message } from '../../types';
import { format, parseISO } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import { useConversations, useMessages } from '../../hooks/useQueries';
import { useMutation } from '@tanstack/react-query';
import { messageService } from '../../services/messageService';
import { socketService } from '../../services/socketService';
import { useEffect } from 'react';

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
    
    // Receiver is the CA admin.
    // If the conversation metadata contains admin details, use that.
    // Otherwise fallback to default admin.
    const receiverId = conversation?.clientProfile?.adminId || 'admin-user-id';

    sendMutation.mutate({
      conversationId,
      receiverId,
      content: message.trim(),
    });
  };

  const handleAttach = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (!result.canceled && result.assets[0]) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: 'conv-001',
        senderId: user?.id || 'client-001',
        receiverId: 'admin-001',
        fileName: result.assets[0].name,
        fileType: result.assets[0].mimeType || 'application/octet-stream',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  const isMyMessage = (senderId: string) =>
    senderId === user?.id;

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
            <Text style={styles.dateText}>{format(parseISO(item.createdAt), 'dd MMM yyyy')}</Text>
            <View style={styles.dateLine} />
          </View>
        )}
        <View style={[styles.bubbleWrapper, isMe && styles.myWrapper]}>
          {!isMe && (
            <AppAvatar
              name="Admin CA"
              size="xs"
            />
          )}
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
            {item.fileName ? (
              <View style={styles.fileAttach}>
                <MaterialIcons name="insert-drive-file" size={20} color={isMe ? Colors.textLight : Colors.secondary} />
                <Text style={[styles.fileName, isMe && styles.myText]} numberOfLines={1}>{item.fileName}</Text>
              </View>
            ) : (
              <Text style={[styles.bubbleText, isMe && styles.myText]}>{item.content}</Text>
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
        <AppAvatar name="Admin CA" size="sm" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>CA Admin Portal</Text>
          <Text style={styles.headerSub}>Your Assigned Chartered Accountant</Text>
        </View>
        <View style={styles.onlineIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

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
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
            <MaterialIcons name="attach-file" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Message your CA..."
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
  headerInfo: { flex: 1 },
  headerName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  onlineText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.success,
  },
  messageList: { padding: Spacing.sm, paddingBottom: Spacing.base },
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
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    maxWidth: '80%',
  },
  myWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    maxWidth: 280,
  },
  myBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
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
  myText: { color: Colors.textLight },
  fileAttach: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fileName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    maxWidth: 200,
  },
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
  sendBtnActive: { backgroundColor: Colors.primary },
});
