/**
 * @fileoverview React Query configuration and custom hooks
 * Centralized server state management with caching and optimizations
 */

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    },
    mutations: {
      retry: 1
    }
  }
});

// API base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000
});

// Generic fetch function
const fetchData = async (url, params = {}) => {
  const { data } = await api.get(url, { params });
  return data;
};

// Custom hooks for common API calls
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchData('/categories'),
    staleTime: 10 * 60 * 1000 // Categories don't change often
  });
};

export const useItems = (categoryId, filters = {}) => {
  return useQuery({
    queryKey: ['items', categoryId, filters],
    queryFn: () => fetchData('/items', { categoryId, ...filters }),
    enabled: !!categoryId
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => fetchData('/events')
  });
};

export const useDailyOffers = () => {
  return useQuery({
    queryKey: ['daily-offers'],
    queryFn: () => fetchData('/daily-offers')
  });
};

// Mutation hooks
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newItem) => api.post('/items', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    }
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...updateData }) => api.put(`/items/${id}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    }
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.delete(`/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    }
  });
};

// Provider component
export const ReactQueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
