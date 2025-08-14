import { api } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Only send email and password to backend (confirmPassword is frontend-only validation)
    const { email, password } = userData;
    const response = await api.post<AuthResponse>('/auth/register', { email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },
};