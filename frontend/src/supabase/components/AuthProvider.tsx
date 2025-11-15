import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../../services/auth'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User as UserProfile } from '../types/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, password: string, nickname?: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateProfile: (updates: { nickname?: string; avatar_url?: string }) => Promise<{ success: boolean; message: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!profile

  // 初始化认证状态
  useEffect(() => {
    initializeAuth()

    // 监听认证状态变化
    const setupAuthListener = async () => {
      const { data: { subscription } } = await AuthService.onAuthStateChangeForProvider(
        async (event: string, session: any) => {
          console.log('认证状态变化:', event, session?.user?.email)

          if (session?.user) {
            setUser(session.user)
            setSession(session)

            try {
              const userProfile = await AuthService.getCurrentUser();
              setProfile((userProfile || null) as any);
            } catch (error) {
              console.warn("⚠️ [AuthProvider] 获取用户资料失败:", error);
              setProfile(null);
            }
          } else {
            setUser(null)
            setProfile(null)
            setSession(null)
          }

          setIsLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }

    const unsubscribe = setupAuthListener()

    return () => {
      unsubscribe.then(unsub => unsub && unsub())
    }
  }, [])

  const initializeAuth = async () => {
    try {
      const { session } = await AuthService.getCurrentSession()

      if (session?.user) {
        setUser(session.user)
        setSession(session)

        try {
          const userProfile = await AuthService.getCurrentUser();
          setProfile((userProfile || null) as any)
        } catch (profileError) {
          console.warn("⚠️ [AuthProvider] 获取用户资料失败:", profileError);
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await AuthService.signIn({ email, password })

      if (result.success && result.user) {
        // 获取完整的会话信息
        const { session } = await AuthService.getCurrentSession();

        // 获取 Supabase 用户和用户资料
        if (session?.user) {
          setUser(session.user);

          try {
            const userProfile = await AuthService.getCurrentUser();
            setProfile((userProfile || null) as any);
          } catch (profileError) {
            console.warn("⚠️ [AuthProvider] 登录时获取用户资料失败:", profileError);
            setProfile(null);
          }
        }

        setSession(session)

        return {
          success: true,
          message: '登录成功',
        }
      }

      return {
        success: false,
        message: '登录失败，请检查邮箱和密码',
      }
    } catch (error) {
      return {
        success: false,
        message: '登录过程中发生错误，请稍后重试',
      }
    }
  }

  const register = async (email: string, password: string, nickname?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await AuthService.signUp({ email, password, nickname })

      if (result.success && result.user) {
        // 获取完整的会话信息
        const { session } = await AuthService.getCurrentSession();

        // 获取 Supabase 用户和用户资料
        if (session?.user) {
          setUser(session.user);

          // 获取用户完整资料
          const userProfile = await AuthService.getCurrentUser();
          setProfile(userProfile as any);
        }

        setSession(session)

        return {
          success: true,
          message: '注册成功',
        }
      }

      return {
        success: false,
        message: '注册失败，请稍后重试',
      }
    } catch (error) {
      return {
        success: false,
        message: '注册过程中发生错误，请稍后重试',
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await AuthService.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const updateProfile = async (updates: { nickname?: string; avatar_url?: string }): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: '用户未登录',
      }
    }

    try {
      const result = await AuthService.updateProfile(user.id, updates)

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        }
      }

      if (result.profile) {
        setProfile(result.profile)
        return {
          success: true,
          message: result.message,
        }
      }

      return {
        success: false,
        message: '资料更新失败',
      }
    } catch (error) {
      return {
        success: false,
        message: '更新过程中发生错误',
      }
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    return await AuthService.resetPassword(email);
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

