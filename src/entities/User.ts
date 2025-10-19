// User entity for managing user data and authentication
export class User {
  static currentUser: any = null;

  // Simulate fetching current user
  static async me(): Promise<any> {
    // For demo purposes, return a mock user or null
    return this.currentUser;
  }

  // Simulate user login
  static async login(): Promise<void> {
    // For demo purposes, simulate login success
    this.currentUser = {
      id: 'demo-user',
      name: 'משתמש דמו',
      email: 'demo@tovali.com',
      phone: '050-1234567',
      userType: 'customer',
      rating: 4.5,
      reviewCount: 10,
      createdAt: new Date()
    };
    console.log('User logged in:', this.currentUser);
  }

  // Simulate user logout
  static async logout(): Promise<void> {
    this.currentUser = null;
    console.log('User logged out');
  }

  // Simulate updating user data
  static async updateMyUserData(data: any): Promise<void> {
    if (this.currentUser) {
      Object.assign(this.currentUser, data);
      console.log('User data updated:', this.currentUser);
    }
  }
}
