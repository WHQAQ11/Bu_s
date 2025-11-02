import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LoginFormValues } from "@/types/auth";
import { TaiJi, Stars, MysticalAura } from "@/components/ui/TrigramSymbol";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginFormValues>>({});
  const [submitError, setSubmitError] = useState<string>("");

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormValues> = {};

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    // 密码验证
    if (!formData.password.trim()) {
      newErrors.password = "请输入密码";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 清除对应字段的错误
    if (errors[name as keyof LoginFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // 清除提交错误
    if (submitError) {
      setSubmitError("");
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        // 登录成功，navigate 会通过 useEffect 自动处理
        console.log("登录成功:", result.message);
      } else {
        setSubmitError(result.message);
      }
    } catch (error) {
      console.error("登录过程中发生错误:", error);
      setSubmitError("登录失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      {/* 星空背景 */}
      <Stars count={40} />

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* 头部 */}
          <div className="text-center space-y-6">
            <MysticalAura className="inline-block">
              <TaiJi size="lg" className="mx-auto mb-4" />
            </MysticalAura>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-golden-400 via-golden-500 to-golden-600 bg-clip-text text-transparent">
                登录您的账户
              </h2>
              <p className="text-midnight-200">
                还没有账户？{" "}
                <Link
                  to="/register"
                  className="font-medium text-golden-400 hover:text-golden-300 transition-colors duration-300"
                >
                  立即注册
                </Link>
              </p>
            </div>
          </div>

          {/* 登录表单 */}
          <MysticalAura className="bg-midnight-800/90 backdrop-blur-md rounded-xl p-8 border border-primary-500/20 shadow-glow">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 提交错误提示 */}
              {submitError && (
                <div className="bg-midnight-900/50 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-400">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 邮箱输入 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-midnight-200 mb-2"
                >
                  邮箱地址
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-midnight-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-midnight-900/50 border rounded-lg shadow-sm placeholder-midnight-500 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transition-colors duration-300 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-500/30 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    placeholder="请输入您的邮箱"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 animate-slide-down">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 密码输入 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-midnight-200 mb-2"
                >
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-midnight-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-midnight-900/50 border rounded-lg shadow-sm placeholder-midnight-500 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transition-colors duration-300 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-500/30 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    placeholder="请输入您的密码"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 animate-slide-down">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 登录按钮 */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transform transition-all duration-300 ${
                    isLoading
                      ? "bg-midnight-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-mystical-purple to-mystical-indigo hover:from-mystical-purple/90 hover:to-mystical-indigo/90 hover:scale-105 hover:shadow-glow"
                  } text-white focus:ring-primary-500`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      登录中...
                    </>
                  ) : (
                    <>
                      <span>登录</span>
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </MysticalAura>

          {/* 底部链接 */}
          <div className="text-center space-y-4">
            <p className="text-sm text-midnight-400">
              忘记密码？请联系管理员重置
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <p className="text-xs text-midnight-500">安全登录</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-xs text-midnight-500">快速响应</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <p className="text-xs text-midnight-500">隐私保护</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
