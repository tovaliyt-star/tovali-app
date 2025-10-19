// Task Applications entity for managing provider applications to tasks
export interface TaskApplicationData {
  id: string;
  taskId: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerExperience: string;
  applicationMessage: string;
  proposedPrice?: string;
  estimatedDuration?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: Date;
  updatedAt: Date;
}

let _applicationStore: TaskApplicationData[] = [];
let _applicationIdCounter = 1;

// Mock data for demonstration
const mockApplications: TaskApplicationData[] = [
  {
    id: 'app1',
    taskId: 'task1',
    providerId: 'provider1',
    providerName: 'יוסי הובלות',
    providerRating: 4.8,
    providerExperience: '5 שנים ניסיון בהובלות',
    applicationMessage: 'שלום! אני בעל רכב מסחרי גדול עם ניסיון של 5 שנים בהובלות. אני יכול לעזור לך עם ההובלה היום אחר הצהריים.',
    proposedPrice: '₪120',
    estimatedDuration: '2 שעות',
    status: 'pending',
    appliedAt: new Date(Date.now() - 3600000), // לפני שעה
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'app2',
    taskId: 'task1',
    providerId: 'provider2',
    providerName: 'אחמד מחמוד',
    providerRating: 4.6,
    providerExperience: '3 שנים ניסיון בהובלות',
    applicationMessage: 'היי! יש לי רכב מסחרי ואני זמין היום. אני יכול לעשות את העבודה ב-₪100.',
    proposedPrice: '₪100',
    estimatedDuration: '1.5 שעות',
    status: 'pending',
    appliedAt: new Date(Date.now() - 7200000), // לפני שעתיים
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'app3',
    taskId: 'task1',
    providerId: 'provider3',
    providerName: 'שרה לוי',
    providerRating: 4.9,
    providerExperience: '7 שנים ניסיון בהובלות',
    applicationMessage: 'שלום! אני בעלת רכב מסחרי גדול עם רמפה. יש לי ניסיון רב בהובלות רהיטים. אני זמינה היום אחר הצהריים.',
    proposedPrice: '₪140',
    estimatedDuration: '2.5 שעות',
    status: 'pending',
    appliedAt: new Date(Date.now() - 10800000), // לפני 3 שעות
    updatedAt: new Date(Date.now() - 10800000),
  },
  {
    id: 'app4',
    taskId: 'task2',
    providerId: 'provider4',
    providerName: 'משה דוד',
    providerRating: 4.7,
    providerExperience: '4 שנים ניסיון בניקוי',
    applicationMessage: 'שלום! אני מקצועי בניקיון דירות ויש לי כל הציוד הנדרש. אני יכול לעשות עבודה יסודית.',
    proposedPrice: '₪180',
    estimatedDuration: '3 שעות',
    status: 'accepted',
    appliedAt: new Date(Date.now() - 86400000), // אתמול
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'app5',
    taskId: 'task2',
    providerId: 'provider5',
    providerName: 'רחל גולדברג',
    providerRating: 4.5,
    providerExperience: '2 שנים ניסיון בניקוי',
    applicationMessage: 'היי! אני מנוסה בניקיון דירות ואני זמינה היום. אני יכולה לעשות עבודה מעולה.',
    proposedPrice: '₪160',
    estimatedDuration: '2.5 שעות',
    status: 'rejected',
    appliedAt: new Date(Date.now() - 172800000), // לפני יומיים
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'app6',
    taskId: 'task1',
    providerId: 'provider6',
    providerName: 'דוד כהן',
    providerRating: 4.3,
    providerExperience: '6 שנים ניסיון בהובלות',
    applicationMessage: 'שלום! אני בעל רכב מסחרי ואני זמין היום. אני יכול לעזור עם ההובלה.',
    proposedPrice: '₪110',
    estimatedDuration: '1.5 שעות',
    status: 'pending',
    appliedAt: new Date(Date.now() - 1800000), // לפני 30 דקות
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'app7',
    taskId: 'task1',
    providerId: 'provider7',
    providerName: 'מיכל רוזן',
    providerRating: 4.7,
    providerExperience: '4 שנים ניסיון בהובלות',
    applicationMessage: 'היי! יש לי רכב מסחרי גדול ואני זמינה היום אחר הצהריים. אני יכולה לעזור עם ההובלה.',
    proposedPrice: '₪130',
    estimatedDuration: '2 שעות',
    status: 'pending',
    appliedAt: new Date(Date.now() - 900000), // לפני 15 דקות
    updatedAt: new Date(Date.now() - 900000),
  },
  {
    id: 'app8',
    taskId: 'task6',
    providerId: 'provider8',
    providerName: 'אבי לוי',
    providerRating: 4.4,
    providerExperience: '3 שנים ניסיון בשליחויות',
    applicationMessage: 'שלום! אני זמין לקניות ושליחות. אני יכול לעשות את הקניות היום אחר הצהריים.',
    proposedPrice: '₪70',
    estimatedDuration: '1 שעה',
    status: 'pending',
    appliedAt: new Date(Date.now() - 600000), // לפני 10 דקות
    updatedAt: new Date(Date.now() - 600000),
  },
  {
    id: 'app9',
    taskId: 'task6',
    providerId: 'provider9',
    providerName: 'רותי כהן',
    providerRating: 4.6,
    providerExperience: '5 שנים ניסיון בשליחויות',
    applicationMessage: 'היי! אני מנוסה בקניות ושליחות. אני יכולה לעשות את הקניות היום.',
    proposedPrice: '₪75',
    estimatedDuration: '1.5 שעות',
    status: 'pending',
    appliedAt: new Date(Date.now() - 300000), // לפני 5 דקות
    updatedAt: new Date(Date.now() - 300000),
  },
];

// Initialize store
_applicationStore = [...mockApplications];

export const TaskApplication = {
  // Apply for a task
  async apply(data: Omit<TaskApplicationData, 'id' | 'appliedAt' | 'updatedAt'>): Promise<TaskApplicationData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newApplication: TaskApplicationData = {
      ...data,
      id: `app_${_applicationIdCounter++}`,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };
    
    _applicationStore.push(newApplication);
    console.log("Task application created:", newApplication);
    return { ...newApplication };
  },

  // Get applications for a specific task
  async getByTaskId(taskId: string): Promise<TaskApplicationData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return _applicationStore
      .filter(app => app.taskId === taskId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  // Get applications by provider
  async getByProviderId(providerId: string): Promise<TaskApplicationData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return _applicationStore
      .filter(app => app.providerId === providerId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  // Get application by ID
  async getById(applicationId: string): Promise<TaskApplicationData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const application = _applicationStore.find(app => app.id === applicationId);
    return application ? { ...application } : null;
  },

  // Update application status
  async updateStatus(applicationId: string, status: TaskApplicationData['status']): Promise<TaskApplicationData | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const applicationIndex = _applicationStore.findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) {
      return null;
    }
    
    _applicationStore[applicationIndex] = {
      ..._applicationStore[applicationIndex],
      status,
      updatedAt: new Date(),
    };
    
    console.log("Application status updated:", _applicationStore[applicationIndex]);
    return { ..._applicationStore[applicationIndex] };
  },

  // Accept an application
  async accept(applicationId: string): Promise<TaskApplicationData | null> {
    return await this.updateStatus(applicationId, 'accepted');
  },

  // Reject an application
  async reject(applicationId: string): Promise<TaskApplicationData | null> {
    return await this.updateStatus(applicationId, 'rejected');
  },

  // Withdraw an application
  async withdraw(applicationId: string): Promise<TaskApplicationData | null> {
    return await this.updateStatus(applicationId, 'withdrawn');
  },

  // Get pending applications count for a task
  async getPendingCount(taskId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return _applicationStore.filter(app => app.taskId === taskId && app.status === 'pending').length;
  },

  // Check if provider already applied to task
  async hasProviderApplied(taskId: string, providerId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return _applicationStore.some(app => 
      app.taskId === taskId && 
      app.providerId === providerId && 
      app.status !== 'withdrawn'
    );
  },

  // Get accepted application for a task
  async getAcceptedApplication(taskId: string): Promise<TaskApplicationData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const acceptedApp = _applicationStore.find(app => 
      app.taskId === taskId && app.status === 'accepted'
    );
    return acceptedApp ? { ...acceptedApp } : null;
  }
};
