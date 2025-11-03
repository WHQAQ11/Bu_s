import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthService } from "@/services/auth";
import { AuthState, LoginRequest, RegisterRequest, User } from "@/types/auth";

interface AuthStore extends AuthState {
  // Actions
  login: (
    credentials: LoginRequest,
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    userData: RegisterRequest,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  refreshToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: { nickname?: string; avatar_url?: string }) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // 初始为true，因为需要检查Supabase会话

      // Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          token: user ? 'supabase-session' : null, // Supabase会自动管理token
        });
      },

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });

          const response = await AuthService.login(credentials);

          if (response.success && response.user) {
            set({
              user: response.user,
              token: response.token || 'supabase-session',
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true, message: '登录成功' };
          } else {
            set({ isLoading: false });
            return { success: false, message: response?.message || "登录失败" };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.message || "登录失败，请稍后重试",
          };
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true });

          const response = await AuthService.register(userData);

          if (response.success) {
            if (response.user) {
              // 自动登录
              set({
                user: response.user,
                token: response.token || 'supabase-session',
                isAuthenticated: true,
                isLoading: false,
              });

              return { success: true, message: '注册成功' };
            } else {
              // 需要邮箱验证
              set({ isLoading: false });
              return {
                success: true,
                message: '注册成功，请检查邮箱并验证账户'
              };
            }
          } else {
            set({ isLoading: false });
            return { success: false, message: response?.message || "注册失败" };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.message || "注册失败，请稍后重试",
          };
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('登出失败:', error);
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          try {
              // 检查Supabase会话状态
              const isAuthenticated = await AuthService.isAuthenticated();

              if (isAuthenticated) {
                const user = await AuthService.getCurrentUser();

                if (user) {
                  set({
                    user,
                    token: 'supabase-session',
                    isAuthenticated: true,
                    isLoading: false,
                  });
                } else {
                  set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                  });
                }
              } else {
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }
            } catch (err) {
              console.error('❌ [authStore] initializeAuth 出错:', err);
              throw err;
            }
        } catch (error) {
          console.error('❌ [authStore] 初始化认证状态失败:', error);
          // ✅ 失败时也设置为未认证，而不是永远加载
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshToken: async () => {
        try {
          const user = await AuthService.getCurrentUser();
          if (user) {
            set({
              user,
              token: 'supabase-session',
              isAuthenticated: true,
            });
          } else {
            // 用户已登出
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('刷新用户信息失败:', error);
        }
      },

      resetPassword: async (email: string) => {
        return await AuthService.resetPassword(email);
      },

      updateProfile: async (updates: { nickname?: string; avatar_url?: string }) => {
        const currentUser = get().user;
        if (!currentUser) {
          return {
            success: false,
            message: '用户未登录',
          };
        }

        const result = await AuthService.updateProfile(currentUser.id, updates);

        if (result.success) {
          // 刷新用户信息
          await get().refreshToken();
        }

        return result;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // 不持久化token，由Supabase管理
      }),
    },
  ),
);

// 设置认证状态监听
AuthService.onAuthStateChange((user) => {
  const store = useAuthStore.getState();

  if (user && !store.isAuthenticated) {
    // 用户登录
    store.setUser(user);
  } else if (!user && store.isAuthenticated) {
    // 用户登出
    store.setUser(null);
  }
});
