import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList } from '../navigation/AppNavigator';
import { Chat, ChatData } from '../entities/Chat';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';

type Props = BottomTabScreenProps<TabParamList, 'Chat'>;

const { width } = Dimensions.get('window');

export default function ChatScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userData } = useUserData();
  const { userMode } = useUserMode();

  useEffect(() => {
    loadChats();
  }, [userData?.id, userMode]);

  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, [userData?.id, userMode])
  );

  const loadChats = async () => {
    try {
      if (!userData?.id) return;

      const allUserChats = await Chat.getByUserId(userData.id);
      
      // Filter chats based on user mode
      let filteredChats: ChatData[] = [];
      
      if (userMode === 'provider') {
        // For providers, show only chats where they are the provider
        filteredChats = allUserChats.filter(chat => chat.providerId === userData.id);
        console.log('Loaded provider chats:', filteredChats.length);
      } else {
        // For customers, show only chats where they are the client
        filteredChats = allUserChats.filter(chat => chat.clientId === userData.id);
        console.log('Loaded customer chats:', filteredChats.length);
      }
      
      setChats(filteredChats);
      
      // Calculate unread count
      const unread = filteredChats.filter(chat => 
        chat.lastMessage && 
        chat.lastMessage.senderId !== userData.id && 
        !chat.lastMessage.isRead
      ).length;
      setUnreadCount(unread);
      
      console.log('Loaded chats for user mode:', userMode, filteredChats.length);
    } catch (error) {
      console.error('שגיאה בטעינת צ\'אטים:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: ChatData) => {
    // Determine the other participant's name
    const otherParticipantName = userData?.id === chat.clientId ? chat.providerName : chat.clientName;
    const otherParticipantId = userData?.id === chat.clientId ? chat.providerId : chat.clientId;
    
    // Navigate to chat detail
    navigation.navigate('ChatDetail' as any, { 
      chatId: chat.id,
      chatName: otherParticipantName,
      chatService: chat.taskTitle,
      chatStatus: chat.status === 'active' ? 'online' : 'offline',
      otherParticipantId: otherParticipantId,
    });
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} ימים`;
    } else if (hours > 0) {
      return `${hours} שעות`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'עכשיו' : `${minutes} דקות`;
    }
  };

  const getChatDisplayName = (chat: ChatData) => {
    if (!userData?.id) return chat.clientName;
    const isClient = userData.id === chat.clientId;
    const otherName = isClient ? chat.providerName : chat.clientName;
    
    if (userMode === 'provider') {
      // For providers, show client name with "לקוח" label
      return `${otherName} (לקוח)`;
    } else {
      // For customers, show provider name with "נותן שירות" label
      return `${otherName} (נותן שירות)`;
    }
  };

  const getUnreadCountForChat = (chat: ChatData) => {
    if (!chat.lastMessage || !userData?.id) return 0;
    if (chat.lastMessage.senderId === userData.id || chat.lastMessage.isRead) return 0;
    return 1; // For simplicity, we'll show 1 for unread
  };

  const filteredChats = chats.filter(chat =>
    getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.taskCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {userMode === 'provider' ? 'צ\'אטים - נותן שירות' : 'צ\'אטים - מחפש שירות'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} הודעות לא נקראו` : 
             userMode === 'provider' ? 'נהל שיחות עם לקוחות' : 'נהל שיחות עם נותני שירות'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="חיפוש בצ'אטים..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Active Chats */}
        <View style={styles.chatsContainer}>
          <Text style={styles.sectionTitle}>צ'אטים פעילים</Text>
          
          {filteredChats.map((chat) => {
            const displayName = getChatDisplayName(chat);
            const unreadCountForChat = getUnreadCountForChat(chat);
            const lastMessageTime = chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : '';
            
            return (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItem}
                onPress={() => handleChatPress(chat)}
              >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: chat.status === 'active' ? '#10B981' : '#9CA3AF' }]}>
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </View>
                  {chat.status === 'active' && (
                    <View style={styles.onlineIndicator} />
                  )}
                </View>

                {/* Chat Info */}
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{displayName}</Text>
                    <Text style={styles.chatTime}>{lastMessageTime}</Text>
                  </View>
                  <Text style={styles.serviceName}>{chat.taskCategory}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage ? chat.lastMessage.text : 'אין הודעות עדיין'}
                  </Text>
                </View>

                {/* Unread Count */}
                {unreadCountForChat > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{unreadCountForChat}</Text>
                  </View>
                )}

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>אין צ'אטים</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'לא נמצאו צ\'אטים לחיפוש שלך' : 
               userMode === 'provider' ? 'עדיין אין לך צ\'אטים עם לקוחות' : 'עדיין אין לך צ\'אטים עם נותני שירות'}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  chatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'right',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  serviceName: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});
