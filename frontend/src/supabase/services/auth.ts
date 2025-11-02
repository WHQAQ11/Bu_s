import { supabase } from './client'
import type { User, AuthError, Session } from '@supabase/supabase-js'
import type { User as UserProfile } from '../types/supabase'

export interface AuthResponse {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  error: AuthError | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  nickname?: string
}

export class AuthService {
  /**
   * 用户注册
   */
  static async signUp(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            nickname: credentials.nickname,
          },
        },
      })

      if (error) {
        return { user: null, profile: null, session: null, error }
      }

      // 如果注册成功且用户已确认，获取用户资料
      let profile: UserProfile | null = null
      if (data.user) {
        profile = await this.getUserProfile(data.user.id)
      }

      return {
        user: data.user,
        profile,
        session: data.session,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        profile: null,
        session: null,
        error: error as AuthError,
      }
    }
  }

  /**
   * 用户登录
   */
  static async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, profile: null, session: null, error }
      }

      // 获取用户完整资料
      let profile: UserProfile | null = null
      if (data.user) {
        profile = await this.getUserProfile(data.user.id)
      }

      return {
        user: data.user,
        profile,
        session: data.session,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        profile: null,
        session: null,
        error: error as AuthError,
      }
    }
  }

  /**
   * 用户登出
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * 获取当前用户
   */
  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        return { user: null, profile: null, session: null, error }
      }

      if (!user) {
        return { user: null, profile: null, session: null, error: null }
      }

      // 获取用户完整资料
      const profile = await this.getUserProfile(user.id)

      return {
        user,
        profile,
        session: null, // 需要时可通过getSession()获取
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        profile: null,
        session: null,
        error: error as AuthError,
      }
    }
  }

  /**
   * 获取当前会话
   */
  static async getCurrentSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      return { session: null, error: error as AuthError }
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * 更新密码
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * 更新用户资料
   */
  static async updateProfile(userId: string, updates: {
    nickname?: string
    avatar_url?: string
  }): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      return { profile: data, error }
    } catch (error) {
      return { profile: null, error }
    }
  }

  /**
   * 获取用户资料
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户资料失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户资料异常:', error)
      return null
    }
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}