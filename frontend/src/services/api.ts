const API_BASE_URL = 'http://localhost:8080';

export interface UrlItem {
  id: number;
  shortCode: String;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string | null;
  status: string;
  clickCount: number;
}

export interface AnalyticsData {
  totalClicks: number;
  byCountry: { name: string; value: number }[];
  byBrowser: { name: string; value: number }[];
  byDevice: { name: string; value: number }[];
  clickHistory: { date: string; count: number }[];
}

export interface UserSession {
  token: string;
  username: string;
  email: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session: UserSession = JSON.parse(sessionStr);
        headers['Authorization'] = `Bearer ${session.token}`;
      } catch (e) {
        // Clear corrupt session
        localStorage.removeItem('session');
      }
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth Operations
  register(username: string, email: string, password: string): Promise<UserSession> {
    return this.request<UserSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  login(username: string, password: string): Promise<UserSession> {
    return this.request<UserSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // URL Operations
  createUrl(longUrl: string, customAlias?: string, expiresAt?: string): Promise<UrlItem> {
    return this.request<UrlItem>('/api/v1/urls', {
      method: 'POST',
      body: JSON.stringify({ longUrl, customAlias, expiresAt }),
    });
  }

  getUserUrls(): Promise<UrlItem[]> {
    return this.request<UrlItem[]>('/api/v1/urls');
  }

  deleteUrl(shortCode: String): Promise<void> {
    return this.request<void>(`/api/v1/urls/${shortCode}`, {
      method: 'DELETE',
    });
  }

  getUrlStats(shortCode: String): Promise<AnalyticsData> {
    return this.request<AnalyticsData>(`/api/v1/urls/${shortCode}/stats`);
  }
}

export const api = new ApiService();
