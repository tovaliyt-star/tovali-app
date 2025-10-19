// Chat entity for managing conversations between clients and providers
export interface ChatData {
  id: string;
  taskId: string;
  clientId: string;
  providerId: string;
  clientName: string;
  providerName: string;
  taskTitle: string;
  taskCategory: string;
  status: 'active' | 'completed' | 'archived';
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    isRead: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageData {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
}

import AsyncStorage from '@react-native-async-storage/async-storage';

let _chatStore: ChatData[] = [];
let _messageStore: MessageData[] = [];
let _chatIdCounter = 1;
let _messageIdCounter = 1;

// Storage keys
const CHAT_STORAGE_KEY = 'tovali_chats';
const MESSAGE_STORAGE_KEY = 'tovali_messages';
const CHAT_COUNTER_KEY = 'tovali_chat_counter';
const MESSAGE_COUNTER_KEY = 'tovali_message_counter';

// Load data from AsyncStorage
const loadFromStorage = async () => {
  try {
    const [chatsData, messagesData, chatCounter, messageCounter] = await Promise.all([
      AsyncStorage.getItem(CHAT_STORAGE_KEY),
      AsyncStorage.getItem(MESSAGE_STORAGE_KEY),
      AsyncStorage.getItem(CHAT_COUNTER_KEY),
      AsyncStorage.getItem(MESSAGE_COUNTER_KEY),
    ]);

    if (chatsData) {
      const parsedChats = JSON.parse(chatsData).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        lastMessage: chat.lastMessage ? {
          ...chat.lastMessage,
          timestamp: new Date(chat.lastMessage.timestamp),
        } : undefined,
      }));
      _chatStore = parsedChats;
    }

    if (messagesData) {
      const parsedMessages = JSON.parse(messagesData).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      _messageStore = parsedMessages;
    }

    if (chatCounter) {
      _chatIdCounter = parseInt(chatCounter) + 1;
    }

    if (messageCounter) {
      _messageIdCounter = parseInt(messageCounter) + 1;
    }
  } catch (error) {
    console.error('Error loading chat data from storage:', error);
  }
};

// Save data to AsyncStorage
const saveToStorage = async () => {
  try {
    await Promise.all([
      AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(_chatStore)),
      AsyncStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(_messageStore)),
      AsyncStorage.setItem(CHAT_COUNTER_KEY, _chatIdCounter.toString()),
      AsyncStorage.setItem(MESSAGE_COUNTER_KEY, _messageIdCounter.toString()),
    ]);
  } catch (error) {
    console.error('Error saving chat data to storage:', error);
  }
};

// Initialize data on module load
loadFromStorage();

// Mock data for demonstration
const mockChats: ChatData[] = [
  {
    id: 'chat1',
    taskId: 'task2',
    clientId: 'user1',
    providerId: 'user2',
    clientName: 'אחמד מחמוד',
    providerName: 'יוסי הובלות',
    taskTitle: 'העברת ריהוט מדירה לדירה באותו הבניין',
    taskCategory: 'הובלות קטנות',
    status: 'active',
    lastMessage: {
      text: 'מתי תוכל להגיע?',
      senderId: 'user1',
      senderName: 'אחמד מחמוד',
      timestamp: new Date(Date.now() - 3600000), // לפני שעה
      isRead: false,
    },
    createdAt: new Date(Date.now() - 86400000), // אתמול
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'chat2',
    taskId: 'task3',
    clientId: 'user3',
    providerId: 'user2',
    clientName: 'שרה כהן',
    providerName: 'יוסי הובלות',
    taskTitle: 'ניקוי יסודי של דירה בת 3 חדרים',
    taskCategory: 'ניקוי דירה',
    status: 'active',
    lastMessage: {
      text: 'תודה על השירות המעולה!',
      senderId: 'user3',
      senderName: 'שרה כהן',
      timestamp: new Date(Date.now() - 7200000), // לפני שעתיים
      isRead: true,
    },
    createdAt: new Date(Date.now() - 172800000), // לפני יומיים
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'chat3',
    taskId: 'task4',
    clientId: 'user4',
    providerId: 'user2',
    clientName: 'משה לוי',
    providerName: 'יוסי הובלות',
    taskTitle: 'הובלת מכשירי חשמל גדולים',
    taskCategory: 'הובלות קטנות',
    status: 'completed',
    lastMessage: {
      text: 'המשימה הושלמה בהצלחה!',
      senderId: 'user2',
      senderName: 'יוסי הובלות',
      timestamp: new Date(Date.now() - 86400000), // אתמול
      isRead: true,
    },
    createdAt: new Date(Date.now() - 259200000), // לפני 3 ימים
    updatedAt: new Date(Date.now() - 86400000),
  },
];

const mockMessages: MessageData[] = [
  // Chat 1 messages
  {
    id: 'msg1',
    chatId: 'chat1',
    senderId: 'user1',
    senderName: 'אחמד מחמוד',
    text: 'שלום! האם השירות עדיין זמין?',
    timestamp: new Date(Date.now() - 7200000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: 'msg2',
    chatId: 'chat1',
    senderId: 'user2',
    senderName: 'יוסי הובלות',
    text: 'כן, בהחלט! אני זמין היום עד 18:00',
    timestamp: new Date(Date.now() - 7000000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: 'msg3',
    chatId: 'chat1',
    senderId: 'user1',
    senderName: 'אחמד מחמוד',
    text: 'מעולה! אני צריך הובלה קטנה מדירה בדרום תל אביב לצפון העיר',
    timestamp: new Date(Date.now() - 6800000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: 'msg4',
    chatId: 'chat1',
    senderId: 'user2',
    senderName: 'יוסי הובלות',
    text: 'בסדר גמור! מה בדיוק צריך להעביר?',
    timestamp: new Date(Date.now() - 6600000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: 'msg5',
    chatId: 'chat1',
    senderId: 'user1',
    senderName: 'אחמד מחמוד',
    text: 'מתי תוכל להגיע?',
    timestamp: new Date(Date.now() - 3600000),
    isRead: false,
    messageType: 'text',
  },
  // Chat 2 messages
  {
    id: 'msg6',
    chatId: 'chat2',
    senderId: 'user3',
    senderName: 'שרה כהן',
    text: 'שלום! אני מעוניינת בניקוי דירה',
    timestamp: new Date(Date.now() - 172800000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: 'msg7',
    chatId: 'chat2',
    senderId: 'user2',
    senderName: 'יוסי הובלות',
    text: 'שלום שרה! אני יכול לעזור לך עם ניקוי הדירה',
    timestamp: new Date(Date.now() - 170000000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: 'msg8',
    chatId: 'chat2',
    senderId: 'user3',
    senderName: 'שרה כהן',
    text: 'תודה על השירות המעולה!',
    timestamp: new Date(Date.now() - 7200000),
    isRead: true,
    messageType: 'text',
  },
];

// Initialize stores
_chatStore = [...mockChats];
_messageStore = [...mockMessages];

export const Chat = {
  // Create a new chat
  async create(data: Omit<ChatData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newChat: ChatData = {
      ...data,
      id: `chat_${_chatIdCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    _chatStore.push(newChat);
    await saveToStorage();
    console.log("Chat created:", newChat);
    return { ...newChat };
  },

  // Get all chats for a user (client or provider)
  async getByUserId(userId: string): Promise<ChatData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return _chatStore.filter(chat => 
      chat.clientId === userId || chat.providerId === userId
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  // Get chat by ID
  async getById(chatId: string): Promise<ChatData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const chat = _chatStore.find(chat => chat.id === chatId);
    return chat ? { ...chat } : null;
  },

  // Get chat by task ID
  async getByTaskId(taskId: string): Promise<ChatData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const chat = _chatStore.find(chat => chat.taskId === taskId);
    return chat ? { ...chat } : null;
  },

  // Update chat
  async update(chatId: string, data: Partial<ChatData>): Promise<ChatData | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const chatIndex = _chatStore.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) {
      return null;
    }
    
    _chatStore[chatIndex] = {
      ..._chatStore[chatIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    await saveToStorage();
    console.log("Chat updated:", _chatStore[chatIndex]);
    return { ..._chatStore[chatIndex] };
  },

  // Delete chat
  async delete(chatId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const chatIndex = _chatStore.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) {
      return false;
    }
    
    _chatStore.splice(chatIndex, 1);
    // Also delete all messages in this chat
    _messageStore = _messageStore.filter(msg => msg.chatId !== chatId);
    
    await saveToStorage();
    console.log("Chat deleted:", chatId);
    return true;
  },

  // Create or get existing chat for a task
  async createOrGetForTask(taskId: string, clientId: string, providerId: string, taskDetails?: { title: string; category: string; clientName: string; providerName: string }): Promise<ChatData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if chat already exists for this task
    const existingChat = await this.getByTaskId(taskId);
    if (existingChat) {
      return existingChat;
    }
    
    // Create new chat with proper details
    const newChat = await this.create({
      taskId,
      clientId,
      providerId,
      clientName: taskDetails?.clientName || `לקוח ${clientId}`,
      providerName: taskDetails?.providerName || `נותן שירות ${providerId}`,
      taskTitle: taskDetails?.title || 'משימה חדשה',
      taskCategory: taskDetails?.category || 'כללי',
      status: 'active',
    });
    
    return newChat;
  }
};

export const Message = {
  // Send a message
  async send(data: Omit<MessageData, 'id' | 'timestamp'>): Promise<MessageData> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage: MessageData = {
      ...data,
      id: `msg_${_messageIdCounter++}`,
      timestamp: new Date(),
    };
    
    _messageStore.push(newMessage);
    await saveToStorage();
    
    // Update chat's last message
    const chat = await Chat.getById(data.chatId);
    if (chat) {
      await Chat.update(data.chatId, {
        lastMessage: {
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: newMessage.timestamp,
          isRead: false,
        },
      });
    }
    
    console.log("Message sent:", newMessage);
    return { ...newMessage };
  },

  // Get messages for a chat
  async getByChatId(chatId: string): Promise<MessageData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return _messageStore
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  // Mark messages as read
  async markAsRead(chatId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    _messageStore.forEach(msg => {
      if (msg.chatId === chatId && msg.senderId !== userId) {
        msg.isRead = true;
      }
    });
    
    // Update chat's last message read status
    const chat = await Chat.getById(chatId);
    if (chat && chat.lastMessage && chat.lastMessage.senderId !== userId) {
      chat.lastMessage.isRead = true;
    }
    
    await saveToStorage();
    console.log("Messages marked as read for chat:", chatId);
  },

  // Get unread count for a user
  async getUnreadCount(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userChats = await Chat.getByUserId(userId);
    let unreadCount = 0;
    
    userChats.forEach(chat => {
      if (chat.lastMessage && 
          chat.lastMessage.senderId !== userId && 
          !chat.lastMessage.isRead) {
        unreadCount++;
      }
    });
    
    return unreadCount;
  }
};


