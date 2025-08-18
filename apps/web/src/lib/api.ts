const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  settings?: T;
  methods?: T;
  sessions?: T;
  recipe?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  settings?: UserSettings;
}

export interface UserSettings {
  units: 'METRIC' | 'IMPERIAL';
  tempUnit: 'C' | 'F';
  recommend: boolean;
  defaultMethodId: string | null;
  cupSizeMl: number;
}

export interface BrewMethod {
  id: string;
  key: string;
  name: string;
  defaultRatio: number;
  bloom: boolean;
  pours: number;
  notes: string | null;
  presets: any;
}

export interface BrewSession {
  id: string;
  userId: string;
  methodId: string;
  startedAt: string;
  durationSec: number;
  coffeeGrams: number;
  waterMl: number;
  yieldMl: number;
  grindSetting: string | null;
  waterTempC: number | null;
  rating: number | null;
  notes: string | null;
  pours: any;
  bean: any;
  method: {
    name: string;
    key: string;
  };
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<ApiResponse<User>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async me(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  // Settings endpoints
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    return this.request('/settings');
  }

  async updateSettings(data: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Methods endpoints
  async getMethods(): Promise<ApiResponse<BrewMethod[]>> {
    return this.request('/methods');
  }

  async getMethod(key: string): Promise<ApiResponse<BrewMethod>> {
    return this.request(`/methods/${key}`);
  }

  // Reverse brew endpoint
  async calculateReverseBrew(data: {
    methodKey: string;
    cups: number;
    ratio?: number;
    targetYieldMl?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/reverse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sessions endpoints
  async getSessions(params?: {
    page?: number;
    limit?: number;
    q?: string;
    methodId?: string;
  }): Promise<ApiResponse<BrewSession[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.q) searchParams.set('q', params.q);
    if (params?.methodId) searchParams.set('methodId', params.methodId);
    
    const query = searchParams.toString();
    return this.request(`/sessions${query ? `?${query}` : ''}`);
  }

  async getSession(id: string): Promise<ApiResponse<BrewSession>> {
    return this.request(`/sessions/${id}`);
  }

  async createSession(data: any): Promise<ApiResponse<BrewSession>> {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: string, data: any): Promise<ApiResponse<BrewSession>> {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<ApiResponse> {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();