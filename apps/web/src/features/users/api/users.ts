import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2';
  regionId: number | null;
  createdAt: string;
  regionName?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2';
  regionId?: number;
}

export interface UpdateUserInput {
  name?: string;
  role?: 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2';
  regionId?: number;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    },
  });
};

export const useApproversL1 = () => {
  return useQuery({
    queryKey: ['users', 'approvers', 'L1'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/users/approvers?level=L1');
      return response.data;
    },
  });
};

export const useApproversL2 = () => {
  return useQuery({
    queryKey: ['users', 'approvers', 'L2'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/users/approvers?level=L2');
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const response = await apiClient.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserInput }) => {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
