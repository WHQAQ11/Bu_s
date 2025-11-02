// 认证相关类型定义

export interface User {
  id: string; // Supabase使用UUID
  email: string;
  nickname?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User | null;
  token?: string | null;
  refreshToken?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
}
