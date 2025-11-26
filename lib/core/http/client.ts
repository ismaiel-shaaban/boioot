import { environment } from '@/lib/config/environment';

export interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
  skipAuth?: boolean;
}

export interface ApiResponse<T = any> {
  IsSuccess?: boolean;
  Success?: boolean;
  Data?: T;
  Message?: string;
  Error?: string;
}

class ApiClient {
  private getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private async getHeaders(skipAuth = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': 'ar',
    };

    if (!skipAuth) {
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
        if (!token) {
          token = this.getTokenFromCookies();
        }
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.Error || errorData.Message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async get<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(options.skipAuth);
    
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  private mergeHeaders(base: Record<string, string>, extra?: HeadersInit): Headers {
    const merged = new Headers();
    
    // Add base headers
    Object.entries(base).forEach(([key, value]) => {
      merged.set(key, value);
    });
    
    if (!extra) {
      return merged;
    }

    if (extra instanceof Headers) {
      extra.forEach((value, key) => merged.set(key, value));
    } else if (Array.isArray(extra)) {
      extra.forEach(([key, value]) => merged.set(key, String(value)));
    } else {
      Object.entries(extra).forEach(([key, value]) => merged.set(key, String(value)));
    }

    return merged;
  }

  async post<T>(url: string, body?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(options.skipAuth);

    const isFormData = body instanceof FormData;
    const requestHeaders = this.mergeHeaders(headers, options.headers);

    if (isFormData) {
      requestHeaders.delete('Content-Type');
    }

    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: requestHeaders as HeadersInit,
      body: isFormData ? body : JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, body?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(options.skipAuth);

    const isFormData = body instanceof FormData;
    const requestHeaders = this.mergeHeaders(headers, options.headers);

    if (isFormData) {
      requestHeaders.delete('Content-Type');
    }

    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: requestHeaders as HeadersInit,
      body: isFormData ? body : JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(options.skipAuth);

    const response = await fetch(url, {
      ...options,
      method: 'DELETE',
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();

