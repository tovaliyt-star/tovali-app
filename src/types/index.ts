export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  userType: 'customer' | 'provider';
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  priceType: 'hourly' | 'fixed' | 'negotiable';
  providerId: string;
  provider: User;
  images: string[];
  location: {
    city: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  totalPrice: number;
  scheduledDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  rating?: number;
  availability?: {
    day: string;
    time: string;
  };
}
