import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse } from '../types';

interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
): UseApiState<T> & {
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
} {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api${url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, data: result.data || null, loading: false }));
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Unknown error', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Network error', 
        loading: false 
      }));
    }
  }, [url]);

  const mutate = useCallback((newData: T) => {
    setState(prev => ({ ...prev, data: newData }));
  }, []);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [fetchData, ...(options.dependencies || [])]);

  return {
    ...state,
    refetch: fetchData,
    mutate,
  };
}

export function useApiMutation<T = any, P = any>(
  baseUrl: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (payload?: P, options?: { url?: string }): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const url = options?.url || baseUrl;
      const response = await fetch(`/api${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, data: result.data || null, loading: false }));
        return result.data || null;
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Unknown error', loading: false }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [baseUrl, method]);

  return {
    ...state,
    mutate,
  };
}

export function usePaginatedApi<T>(
  url: string,
  page: number = 1,
  limit: number = 10,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<{
    data: T[];
    pagination: PaginatedResponse<T>['pagination'] | null;
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    pagination: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api${url}?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaginatedResponse<T> = await response.json();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          data: result.data || [], 
          pagination: result.pagination,
          loading: false 
        }));
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Unknown error', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Network error', 
        loading: false 
      }));
    }
  }, [url, page, limit]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [fetchData, ...(options.dependencies || [])]);

  return {
    ...state,
    refetch: fetchData,
  };
}