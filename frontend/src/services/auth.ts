import { supabase } from '@/supabase/services/client'
import type { User as SupabaseUser, AuthError } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/supabase/types/supabase'
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/types/auth";

// 适配器：将Supabase用户转换为应用用户类型
function adaptSupabaseUser(supabaseUser: SupabaseUser, profile: UserProfile | null): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    nickname: profile?.nickname || null,
    avatar_url: profile?.avatar_url || null,
    created_at: supabaseUser.created_at,
    updated_at: profile?.updated_at || supabaseUser.created_at,
  }
}

// 适配器：将应用注册请求转换为Supabase注册请求
function adaptRegisterRequest(request: RegisterRequest) {
  return {
    email: request.email,
    password: request.password,
    nickname: request.nickname,
  }
}

export class AuthService {
  // 用户登录
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        console.error("登录失败:", error);
        throw new Error(this.getErrorMessage(error));
      }

      if (data.user && data.session) {
        // ✅ 优化：查询users表获取用户扩展信息
        let profile: UserProfile | null = null;

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // 记录不存在，创建新记录
              console.log("📝 [AuthService] users表中无记录，创建新记录");
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .upsert({
                  id: data.user.id,
                  email: data.user.email || '',
                  nickname: data.user.user_metadata?.nickname || null,
                })
                .select()
                .single();

              if (!createError && newProfile) {
                profile = newProfile;
                console.log("✅ [AuthService] 成功创建users记录");
              } else {
                console.warn("⚠️ [AuthService] 创建users记录失败:", createError);
              }
            } else {
              console.warn("⚠️ [AuthService] 查询users表失败:", profileError);
            }
          } else {
            profile = profileData;
            console.log("✅ [AuthService] 成功获取用户扩展信息");
          }
        } catch (profileError) {
          console.warn("⚠️ [AuthService] 处理users表时发生错误:", profileError);
          // 继续，不中断登录流程
        }

        const adaptedUser = adaptSupabaseUser(data.user, profile)

        return {
          success: true,
          user: adaptedUser,
          token: data.session.access_token,
        }
      }

      throw new Error("登录失败，请检查邮箱和密码");
    } catch (error: any) {
      console.error("登录失败:", error);
      throw new Error(error.message || "登录失败，请稍后重试");
    }
  }

  // 用户注册
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const adaptedData = adaptRegisterRequest(userData);

      const { data, error } = await supabase.auth.signUp({
        email: adaptedData.email,
        password: adaptedData.password,
        options: {
          data: {
            nickname: adaptedData.nickname,
          },
        },
      })

      if (error) {
        console.error("注册失败:", error);
        throw new Error(this.getErrorMessage(error));
      }

      if (data.user) {
        const adaptedUser = adaptSupabaseUser(data.user, null);

        return {
          success: true,
          user: adaptedUser,
          token: data.session?.access_token || null,
        }
      }

      throw new Error("注册失败，请稍后重试");
    } catch (error: any) {
      console.error("注册失败:", error);
      throw new Error(error.message || "注册失败，请稍后重试");
    }
  }

  // 获取当前用户
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return null;
      }

      // ✅ 优化：查询users表获取用户扩展信息
      let profile: UserProfile | null = null;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // 记录不存在，可能是因为数据库触发器还没执行
            console.log("📝 [AuthService] users表中无记录，尝试创建新记录");
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email || '',
                nickname: user.user_metadata?.nickname || null,
              })
              .select()
              .single();

            if (!createError && newProfile) {
              profile = newProfile;
              console.log("✅ [AuthService] 成功创建users记录");
            } else {
              console.warn("⚠️ [AuthService] 创建users记录失败:", createError);
            }
          } else {
            console.warn("⚠️ [AuthService] 查询users表失败:", profileError);
          }
        } else {
          profile = profileData;
          console.log("✅ [AuthService] 成功获取用户扩展信息");
        }
      } catch (profileError) {
        console.warn("⚠️ [AuthService] 处理users表时发生错误:", profileError);
        // 继续，使用基础用户信息
      }

      return adaptSupabaseUser(user, profile);
    } catch (error: any) {
      console.error("获取用户信息失败:", error);
      return null;
    }
  }

  // 检查认证状态
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      return false
    }
  }

  // 监听认证状态变化
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }

  // 辅助方法：格式化错误信息
  private static getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return '邮箱或密码错误'
      case 'User already registered':
        return '该邮箱已被注册'
      case 'Email not confirmed':
        return '请先验证邮箱'
      case 'Password should be at least 6 characters':
        return '密码至少需要6个字符'
      case 'Invalid email':
        return '邮箱格式不正确'
      default:
        return error.message || '操作失败，请稍后重试'
    }
  }

  // 兼容性方法：供AuthProvider使用
  static async signIn(credentials: LoginRequest): Promise<AuthResponse> {
    return this.login(credentials);
  }

  static async signUp(userData: RegisterRequest): Promise<AuthResponse> {
    return this.register(userData);
  }

  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("登出失败:", error);
      throw new Error(error.message || "登出失败");
    }
  }

  // 兼容性方法：logout
  static async logout(): Promise<void> {
    return this.signOut();
  }

  static async getCurrentSession(): Promise<{ session: any }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return { session };
    } catch (error: any) {
      console.error("获取会话失败:", error);
      throw new Error(error.message || "获取会话失败");
    }
  }

  static async onAuthStateChangeForProvider(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          message: this.getErrorMessage(error),
        }
      }

      return {
        success: true,
        message: "密码重置邮件已发送，请检查邮箱",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "发送重置邮件失败",
      }
    }
  }

  static async updateProfile(userId: string, updates: { nickname?: string; avatar_url?: string }): Promise<{ success: boolean; message: string; profile?: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: error.message || "更新资料失败",
        }
      }

      return {
        success: true,
        message: "资料更新成功",
        profile: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "更新过程中发生错误",
        profile: null,
      };
    }
  }
}