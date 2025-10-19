import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Chat, Message, MessageData, ChatData } from '../entities/Chat';
import { useUserData } from '../context/UserDataContext';

const { width, height } = Dimensions.get('window');

export default function ChatDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [chat, setChat] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUserData();
  
  // קבלת פרטי הצ'אט מהניווט
  const chatId = route.params?.chatId;
  const chatName = route.params?.chatName || 'משתמש';
  const chatService = route.params?.chatService || 'שירות';
  const chatStatus = route.params?.chatStatus || 'offline';
  const otherParticipantId = route.params?.otherParticipantId;

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatData();
  }, [chatId]);

  useEffect(() => {
    // גלילה אוטומטית לתחתית הצ'אט
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      
      // Load chat data
      const chatData = await Chat.getById(chatId);
      setChat(chatData);
      
      // Load messages
      const chatMessages = await Message.getByChatId(chatId);
      setMessages(chatMessages);
      
      // Mark messages as read
      if (userData?.id) {
        await Message.markAsRead(chatId, userData.id);
      }
      
      console.log('Loaded chat data:', chatId, chatMessages.length, 'messages');
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הצ\'אט:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (messageText.trim() && userData?.id && chatId) {
      try {
        const newMessage = await Message.send({
          chatId,
          senderId: userData.id,
          senderName: userData.name || 'אני',
          text: messageText.trim(),
          isRead: false,
          messageType: 'text',
        });
        
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
        
      } catch (error) {
        console.error('שגיאה בשליחת הודעה:', error);
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMyMessage = (message: MessageData) => {
    return message.senderId === userData?.id;
  };

  // Determine message alignment based on role
  const getMessageAlignment = (message: MessageData) => {
    if (!chat) return 'right';
    
    const isClient = userData?.id === chat.clientId;
    const isFromClient = message.senderId === chat.clientId;
    
    // If I'm the client and this message is from client -> right
    // If I'm the provider and this message is from client -> right
    // If I'm the client and this message is from provider -> left
    // If I'm the provider and this message is from provider -> left
    
    if (isClient && isFromClient) return 'right';  // Client messages on right
    if (!isClient && isFromClient) return 'right'; // Client messages on right
    if (isClient && !isFromClient) return 'left';   // Provider messages on left
    if (!isClient && !isFromClient) return 'left'; // Provider messages on left
    
    return 'right';
  };

  // Determine user role and other participant role
  const isClient = userData?.id === chat?.clientId;
  const userRole = isClient ? 'מזמין שירות' : 'נותן שירות';
  const otherRole = isClient ? 'נותן שירות' : 'מזמין שירות';

  const chatInfo = {
    name: chatName,
    service: chatService,
    status: chatStatus,
    lastSeen: chatStatus === 'online' ? 'עכשיו' : 'לפני שעה',
    userRole: userRole,
    otherRole: otherRole,
  };

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.chatInfo}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: chatInfo.status === 'online' ? '#10B981' : '#9CA3AF' }]}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
            {chatInfo.status === 'online' && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{chatInfo.name}</Text>
            <Text style={styles.serviceName}>{chatInfo.service} • {chatInfo.otherRole}</Text>
            <Text style={styles.statusText}>
              {chatInfo.status === 'online' ? 'מחובר עכשיו' : `נראה לאחרונה ${chatInfo.lastSeen}`}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>טוען הודעות...</Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const alignment = getMessageAlignment(message);
            const isFromClient = message.senderId === chat?.clientId;
            
            return (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  alignment === 'right' ? styles.rightMessage : styles.leftMessage,
                  index === 0 && styles.firstMessage,
                  index === messages.length - 1 && styles.lastMessage,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    alignment === 'right' ? styles.clientBubble : styles.providerBubble,
                  ]}
                >
                  {/* Message sender info */}
                  <View style={styles.messageHeader}>
                    <Text style={[
                      styles.senderName,
                      alignment === 'right' ? styles.clientSenderName : styles.providerSenderName
                    ]}>
                      {isFromClient ? `מזמין שירות: ${message.senderName}` : `נותן שירות: ${message.senderName}`}
                    </Text>
                  </View>
                  
                  <Text
                    style={[
                      styles.messageText,
                      alignment === 'right' ? styles.clientMessageText : styles.providerMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  
                  <View style={styles.messageFooter}>
                    <Text style={styles.messageTime}>
                      {formatTime(message.timestamp)}
                    </Text>
                    
                    {isMyMessage(message) && (
                      <View style={styles.readStatus}>
                        <Ionicons 
                          name={message.isRead ? "checkmark-done" : "checkmark"} 
                          size={16} 
                          color={message.isRead ? "#3B82F6" : "#9CA3AF"} 
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="הקלד הודעה..."
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={messageText.trim() ? "#FFFFFF" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 11,
    color: '#6B7280',
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    marginBottom: 16,
  },
  firstMessage: {
    marginTop: 8,
  },
  lastMessage: {
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rightMessage: {
    alignItems: 'flex-end',
  },
  leftMessage: {
    alignItems: 'flex-start',
  },
  clientBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 8,
  },
  providerBubble: {
    backgroundColor: '#10B981',
    borderBottomLeftRadius: 8,
  },
  messageHeader: {
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  clientSenderName: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  providerSenderName: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  clientMessageText: {
    color: '#FFFFFF',
  },
  providerMessageText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  readStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    textAlign: 'right',
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
  sendButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
