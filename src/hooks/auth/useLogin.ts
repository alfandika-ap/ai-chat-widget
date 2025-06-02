import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import api from '@/lib/api';
import { setToken } from '@/services/token';
import { useAuth } from '@/providers/auth-provider';

type LoginResponse = {
  access_token: string;
  token_type: string
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export const useLogin = () => {
  const { setIsAuthenticated } = useAuth();
  return useMutation<AxiosResponse<LoginResponse>, Error, LoginCredentials>({
    mutationKey: ['login'],
    mutationFn: (credentials: LoginCredentials) => {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      return api.post<LoginResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    },
    onSuccess: (data) => {
      setToken(data.data.access_token);
      setIsAuthenticated(true);
    },
  });
};