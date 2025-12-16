import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { AuthResponse } from '@sekawan/shared';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },
  });
};

export const useProfile = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  });
};
