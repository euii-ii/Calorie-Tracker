// API Service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('🔧 API Service initialized with base URL:', this.baseUrl);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${config.method || 'GET'} ${url}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${config.method || 'GET'} ${url}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; database: string }> {
    return this.request('/health');
  }

  // User Session methods
  async createSession(sessionData: any): Promise<any> {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSessions(params: {
    clerkId?: string;
    days?: number;
    active?: boolean;
  } = {}): Promise<any[]> {
    const searchParams = new URLSearchParams();
    
    if (params.clerkId) searchParams.append('clerkId', params.clerkId);
    if (params.days) searchParams.append('days', params.days.toString());
    if (params.active !== undefined) searchParams.append('active', params.active.toString());
    
    const query = searchParams.toString();
    return this.request(`/sessions${query ? `?${query}` : ''}`);
  }

  async endSession(sessionId: string): Promise<any> {
    return this.request(`/sessions/${sessionId}/end`, {
      method: 'PUT',
    });
  }

  async endAllUserSessions(clerkId: string): Promise<any> {
    return this.request(`/sessions/end-by-clerk/${clerkId}`, {
      method: 'PUT',
    });
  }

  async getSessionStats(clerkId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
    lastSignIn: Date | null;
    signInMethods: Record<string, number>;
  }> {
    return this.request(`/sessions/stats/${clerkId}`);
  }

  // User Profile methods
  async createOrUpdateUser(userData: any): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(clerkId: string): Promise<any> {
    return this.request(`/users/${clerkId}`);
  }

  // Food Log methods
  async createFoodLog(foodLogData: any): Promise<any> {
    return this.request('/food-logs', {
      method: 'POST',
      body: JSON.stringify(foodLogData),
    });
  }

  async getFoodLogs(userId: string, params: {
    date?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<any[]> {
    const searchParams = new URLSearchParams();
    
    if (params.date) searchParams.append('date', params.date);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    
    const query = searchParams.toString();
    return this.request(`/food-logs/${userId}${query ? `?${query}` : ''}`);
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
