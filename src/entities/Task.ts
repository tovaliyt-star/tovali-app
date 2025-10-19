// Mock Task entity for demonstration purposes
export interface TaskData {
  id?: string;
  category: string;
  description: string;
  estimated_duration: string;
  location: string;
  region: string;
  date: Date;
  time: string;
  price: string;
  status: 'פתוח' | 'מוקצה' | 'בביצוע' | 'הושלם' | 'בוטל';
  client_id: string;
  provider_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

let _taskStore: TaskData[] = [];
let _idCounter = 1;

const mockTasks: TaskData[] = [
  {
    id: 'task1',
    category: 'עזרה בבית',
    description: 'צריך עזרה בניקוי הבית לקראת שבת',
    estimated_duration: '3',
    location: 'רחוב דיזנגוף 123, תל אביב',
    region: 'תל אביב והסביבה',
    date: new Date(),
    time: '10:00',
    price: '200',
    status: 'פתוח',
    client_id: 'user1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'task2',
    category: 'הובלות קטנות',
    description: 'העברת ריהוט מדירה לדירה באותו הבניין',
    estimated_duration: '2',
    location: 'רחוב הרצל 45, חיפה',
    region: 'חיפה והקריות',
    date: new Date(Date.now() + 86400000), // מחר
    time: '14:00',
    price: '150',
    status: 'מוקצה',
    client_id: 'user1',
    provider_id: 'user2',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'task3',
    category: 'ניקוי דירה',
    description: 'ניקוי יסודי של דירה בת 3 חדרים',
    estimated_duration: '4',
    location: 'רחוב בן גוריון 78, רמת גן',
    region: 'מרכז',
    date: new Date(Date.now() + 172800000), // בעוד יומיים
    time: '09:00',
    price: '300',
    status: 'בביצוע',
    client_id: 'user3',
    provider_id: 'user2',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'task4',
    category: 'הובלות קטנות',
    description: 'הובלת מכשירי חשמל גדולים',
    estimated_duration: '1.5',
    location: 'רחוב הרצל 12, תל אביב',
    region: 'תל אביב והסביבה',
    date: new Date(Date.now() - 86400000), // אתמול
    time: '16:00',
    price: '180',
    status: 'הושלם',
    client_id: 'user4',
    provider_id: 'user2',
    created_at: new Date(Date.now() - 172800000),
    updated_at: new Date(Date.now() - 3600000),
  },
  {
    id: 'task5',
    category: 'עזרה בבית',
    description: 'עזרה בהרכבת ריהוט חדש',
    estimated_duration: '2.5',
    location: 'רחוב ויצמן 34, חולון',
    region: 'מרכז',
    date: new Date(Date.now() - 259200000), // לפני 3 ימים
    time: '11:00',
    price: '250',
    status: 'הושלם',
    client_id: 'user5',
    provider_id: 'user2',
    created_at: new Date(Date.now() - 345600000),
    updated_at: new Date(Date.now() - 172800000),
  },
  {
    id: 'task6',
    category: 'שליחויות וסידורים',
    description: 'קניות בסופר מרקט עם שליחה לבית',
    estimated_duration: '1.5',
    location: 'רחוב אלנבי 67, תל אביב',
    region: 'תל אביב והסביבה',
    date: new Date(Date.now() + 259200000), // בעוד 3 ימים
    time: '16:00',
    price: '80',
    status: 'פתוח',
    client_id: 'user1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'task7',
    category: 'עזרה טכנית בסיסית',
    description: 'תיקון ברז דולף במטבח',
    estimated_duration: '1',
    location: 'רחוב רוטשילד 89, תל אביב',
    region: 'תל אביב והסביבה',
    date: new Date(Date.now() + 172800000), // בעוד יומיים
    time: '11:00',
    price: '120',
    status: 'פתוח',
    client_id: 'user2',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'task8',
    category: 'הובלות קטנות',
    description: 'הובלת מכשירי חשמל גדולים',
    estimated_duration: '2',
    location: 'רחוב דיזנגוף 45, תל אביב',
    region: 'תל אביב והסביבה',
    date: new Date(Date.now() + 86400000), // מחר
    time: '15:00',
    price: '180',
    status: 'פתוח',
    client_id: 'user3',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Initialize store with mock data
_taskStore = [...mockTasks];

export const Task = {
  async create(data: Omit<TaskData, 'id' | 'created_at' | 'updated_at'>): Promise<TaskData> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const newTask: TaskData = {
      ...data,
      id: `task_${_idCounter++}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    _taskStore.push(newTask);
    console.log("Task created:", newTask);
    return { ...newTask };
  },

  async getAll(): Promise<TaskData[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    return [..._taskStore];
  },

  async getByClientId(clientId: string): Promise<TaskData[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    return _taskStore.filter(task => task.client_id === clientId);
  },

  async getByProviderId(providerId: string): Promise<TaskData[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    return _taskStore.filter(task => task.provider_id === providerId);
  },

  async getByStatus(status: TaskData['status']): Promise<TaskData[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    return _taskStore.filter(task => task.status === status);
  },

  async getById(id: string): Promise<TaskData | null> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    const task = _taskStore.find(task => task.id === id);
    return task ? { ...task } : null;
  },

  async update(id: string, data: Partial<TaskData>): Promise<TaskData | null> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const taskIndex = _taskStore.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return null;
    }
    
    _taskStore[taskIndex] = {
      ..._taskStore[taskIndex],
      ...data,
      updated_at: new Date(),
    };
    
    console.log("Task updated:", _taskStore[taskIndex]);
    return { ..._taskStore[taskIndex] };
  },

  async delete(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    
    const taskIndex = _taskStore.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return false;
    }
    
    _taskStore.splice(taskIndex, 1);
    console.log("Task deleted:", id);
    return true;
  },

  async filter(criteria: Partial<TaskData>): Promise<TaskData[]> {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API call
    
    return _taskStore.filter(task => {
      for (const key in criteria) {
        if (task[key] !== criteria[key]) {
          return false;
        }
      }
      return true;
    });
  }
};
