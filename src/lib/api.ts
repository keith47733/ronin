import { ApiResponse } from '@/types/api';
import { Todo } from '@/types/todo';
import { API_ERROR_CODES } from '@/types/api';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiClient {
  private cache: Map<string, CacheEntry<any>> = new Map();

  private async fetchWithCache<T>(
    url: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url, options);
      
      // Check if response is ok (status in 200-299 range)
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('Response body:', text);
        return {
          error: {
            code: API_ERROR_CODES.INTERNAL_ERROR,
            message: `Server returned ${response.status}: ${response.statusText}`,
            details: text
          }
        };
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        const text = await response.text();
        console.error('Response body:', text);
        return {
          error: {
            code: API_ERROR_CODES.INTERNAL_ERROR,
            message: 'Invalid response format',
            details: { contentType, body: text }
          }
        };
      }

      const data = await response.json();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      return {
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }

  private invalidateCache(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async getTodos(): Promise<ApiResponse<Todo[]>> {
    return this.fetchWithCache<Todo[]>('/api/todos');
  }

  async createTodo(todo: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return this.fetchWithCache<Todo>('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(todo: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return this.fetchWithCache<Todo>('/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
  }

  async updateTodos(updates: Array<{ id: string; order: number; completedAt: string | null }>): Promise<ApiResponse<Todo[]>> {
    return this.fetchWithCache<Todo[]>('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
  }

  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithCache<void>(`/api/todos?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const apiClient = new ApiClient(); 