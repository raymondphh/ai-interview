import { createApiClient } from './api';

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export const authService = {
  login(email: string, password: string) {
    return createApiClient().post<AuthResponse>('/auth/login', { email, password });
  },
  register(name: string, email: string, password: string) {
    return createApiClient().post<AuthResponse>('/auth/register', { name, email, password });
  },
  me() {
    return createApiClient().get('/auth/me');
  },
};
