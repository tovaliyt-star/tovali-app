// Review entity for managing reviews between clients and providers
export interface ReviewData {
  id: string;
  taskId: string;
  reviewerId: string; // מי שכתב את הביקורת
  reviewerName: string;
  reviewerAvatar?: string;
  reviewedUserId: string; // מי שקיבל את הביקורת
  reviewedUserName: string;
  reviewedUserAvatar?: string;
  rating: number; // 1-5 כוכבים
  reviewText: string;
  reviewType: 'client_to_provider' | 'provider_to_client'; // מי כתב למי
  serviceTitle: string;
  serviceCategory: string;
  createdAt: Date;
  updatedAt: Date;
}

let _reviewStore: ReviewData[] = [];
let _reviewIdCounter = 1;

// Mock reviews data
const mockReviews: ReviewData[] = [
  {
    id: 'rev1',
    taskId: 'task4',
    reviewerId: 'user4',
    reviewerName: 'רחל גולדברג',
    reviewedUserId: 'user2',
    reviewedUserName: 'יוסי הובלות',
    rating: 5,
    reviewText: 'שירות מעולה! עבודה מקצועית ומהירה. המחשב עובד כמו חדש. ממליץ בחום!',
    reviewType: 'client_to_provider',
    serviceTitle: 'הובלת מכשירי חשמל גדולים',
    serviceCategory: 'הובלות קטנות',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'rev2',
    taskId: 'task4',
    reviewerId: 'user2',
    reviewerName: 'יוסי הובלות',
    reviewedUserId: 'user4',
    reviewedUserName: 'רחל גולדברג',
    rating: 4,
    reviewText: 'לקוחה מנומסת וקשובה. שילמה בזמן והכל עבר חלק. ממליץ!',
    reviewType: 'provider_to_client',
    serviceTitle: 'הובלת מכשירי חשמל גדולים',
    serviceCategory: 'הובלות קטנות',
    createdAt: new Date(Date.now() - 3000000),
    updatedAt: new Date(Date.now() - 3000000),
  },
  {
    id: 'rev3',
    taskId: 'task5',
    reviewerId: 'user5',
    reviewerName: 'דוד כהן',
    reviewedUserId: 'user2',
    reviewedUserName: 'יוסי הובלות',
    rating: 5,
    reviewText: 'עבודה מדויקת ומקצועית. הדירה נראית מדהים! בהחלט אשתמש בשירות שוב.',
    reviewType: 'client_to_provider',
    serviceTitle: 'עזרה בהרכבת ריהוט חדש',
    serviceCategory: 'עזרה בבית',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'rev4',
    taskId: 'task5',
    reviewerId: 'user2',
    reviewerName: 'יוסי הובלות',
    reviewedUserId: 'user5',
    reviewedUserName: 'דוד כהן',
    rating: 5,
    reviewText: 'לקוח מעולה! ברור מה הוא רוצה ושילם בזמן. עבודה נעימה מאוד.',
    reviewType: 'provider_to_client',
    serviceTitle: 'עזרה בהרכבת ריהוט חדש',
    serviceCategory: 'עזרה בבית',
    createdAt: new Date(Date.now() - 165600000),
    updatedAt: new Date(Date.now() - 165600000),
  },
];

// Initialize store
_reviewStore = [...mockReviews];

export const Review = {
  // Create a new review
  async create(data: Omit<ReviewData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReviewData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newReview: ReviewData = {
      ...data,
      id: `rev_${_reviewIdCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    _reviewStore.push(newReview);
    console.log("Review created:", newReview);
    return { ...newReview };
  },

  // Get reviews for a specific user (as reviewed user)
  async getByReviewedUserId(userId: string): Promise<ReviewData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return _reviewStore
      .filter(review => review.reviewedUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get reviews written by a specific user
  async getByReviewerId(userId: string): Promise<ReviewData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return _reviewStore
      .filter(review => review.reviewerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get reviews for a specific task
  async getByTaskId(taskId: string): Promise<ReviewData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return _reviewStore
      .filter(review => review.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get review by ID
  async getById(reviewId: string): Promise<ReviewData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const review = _reviewStore.find(review => review.id === reviewId);
    return review ? { ...review } : null;
  },

  // Update a review
  async update(reviewId: string, data: Partial<ReviewData>): Promise<ReviewData | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const reviewIndex = _reviewStore.findIndex(review => review.id === reviewId);
    if (reviewIndex === -1) {
      return null;
    }
    
    _reviewStore[reviewIndex] = {
      ..._reviewStore[reviewIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    console.log("Review updated:", _reviewStore[reviewIndex]);
    return { ..._reviewStore[reviewIndex] };
  },

  // Delete a review
  async delete(reviewId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const reviewIndex = _reviewStore.findIndex(review => review.id === reviewId);
    if (reviewIndex === -1) {
      return false;
    }
    
    _reviewStore.splice(reviewIndex, 1);
    console.log("Review deleted:", reviewId);
    return true;
  },

  // Calculate average rating for a user
  async getAverageRating(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const userReviews = _reviewStore.filter(review => review.reviewedUserId === userId);
    
    if (userReviews.length === 0) {
      return 0;
    }
    
    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / userReviews.length) * 10) / 10; // Round to 1 decimal place
  },

  // Get review count for a user
  async getReviewCount(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return _reviewStore.filter(review => review.reviewedUserId === userId).length;
  },

  // Check if user can review (has completed task with the other user)
  async canUserReview(reviewerId: string, reviewedUserId: string, taskId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if review already exists for this task
    const existingReview = _reviewStore.find(review => 
      review.taskId === taskId && 
      review.reviewerId === reviewerId && 
      review.reviewedUserId === reviewedUserId
    );
    
    return !existingReview; // Can review if no review exists yet
  },

  // Get reviews by type (client to provider or provider to client)
  async getByType(userId: string, reviewType: 'client_to_provider' | 'provider_to_client'): Promise<ReviewData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return _reviewStore
      .filter(review => 
        review.reviewedUserId === userId && 
        review.reviewType === reviewType
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};





