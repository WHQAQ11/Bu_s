import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { RegisterFormValues } from "@/types/auth";
import {
  TaiJi,
  BaGua,
  Stars,
  MysticalAura,
} from "@/components/ui/TrigramSymbol";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<RegisterFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });

  const [errors, setErrors] = useState<Partial<RegisterFormValues>>({});
  const [submitError, setSubmitError] = useState<string>("");

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormValues> = {};

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    // 密码验证
    if (!formData.password.trim()) {
      newErrors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码长度至少为6位";
    } else if (formData.password.length > 50) {
      newErrors.password = "密码长度不能超过50位";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "密码必须包含字母和数字";
    }

    // 确认密码验证
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "请确认密码";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    // 昵称验证
    if (formData.nickname && formData.nickname.length > 50) {
      newErrors.nickname = "昵称长度不能超过50个字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 清除对应字段的错误
    if (errors[name as keyof RegisterFormValues]) {
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
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);

      if (result.success) {
        // 注册成功，navigate 会通过 useEffect 自动处理
        console.log("注册成功:", result.message);
      } else {
        setSubmitError(result.message);
      }
    } catch (error) {
      console.error("注册过程中发生错误:", error);
      setSubmitError("注册失败，请稍后重试");
    }
  };

  // 检查密码强度
  const getPasswordStrength = (
    password: string,
  ): { strength: string; color: string } => {
    if (password.length === 0) return { strength: "", color: "" };
    if (password.length < 6) return { strength: "弱", color: "text-red-500" };
    if (password.length >= 6 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { strength: "强", color: "text-green-500" };
    }
    return { strength: "中", color: "text-yellow-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      {/* 星空背景 */}
      <Stars count={40} />

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* 头部 */}
          <div className="text-center space-y-6">
            <MysticalAura className="inline-block">
              <div className="flex items-center justify-center space-x-4">
                <TaiJi size="lg" className="animate-spin-slow" />
                <div className="flex flex-col space-y-2">
                  <BaGua trigram="乾" size="sm" className="text-golden-400" />
                  <BaGua trigram="坤" size="sm" className="text-golden-400" />
                </div>
              </div>
            </MysticalAura>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-golden-400 via-golden-500 to-golden-600 bg-clip-text text-transparent">
                创建新账户
              </h2>
              <p className="text-midnight-200">
                已有账户？{" "}
                <Link
                  to="/login"
                  className="font-medium text-golden-400 hover:text-golden-300 transition-colors duration-300"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </div>

          {/* 注册表单 */}
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
                  邮箱地址 <span className="text-golden-400">*</span>
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

              {/* 昵称输入 */}
              <div>
                <label
                  htmlFor="nickname"
                  className="block text-sm font-medium text-midnight-200 mb-2"
                >
                  昵称 <span className="text-midnight-400">(选填)</span>
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-midnight-900/50 border rounded-lg shadow-sm placeholder-midnight-500 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transition-colors duration-300 ${
                      errors.nickname
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-500/30 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    placeholder="请输入您的昵称"
                  />
                </div>
                {errors.nickname && (
                  <p className="mt-2 text-sm text-red-400 animate-slide-down">
                    {errors.nickname}
                  </p>
                )}
              </div>

              {/* 密码输入 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-midnight-200 mb-2"
                >
                  密码 <span className="text-golden-400">*</span>
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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-midnight-900/50 border rounded-lg shadow-sm placeholder-midnight-500 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transition-colors duration-300 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-500/30 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    placeholder="请输入密码"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 animate-slide-down">
                    {errors.password}
                  </p>
                )}
                {formData.password && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-midnight-400">密码强度:</span>
                    <span
                      className={`text-xs font-medium ${passwordStrength.color}`}
                    >
                      {passwordStrength.strength}
                    </span>
                    <div className="flex-1 bg-midnight-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === "弱"
                            ? "bg-red-500 w-1/3"
                            : passwordStrength.strength === "中"
                              ? "bg-yellow-500 w-2/3"
                              : "bg-green-500 w-full"
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-midnight-500">
                密码需包含字母和数字，长度6-50位
              </p>

              {/* 确认密码输入 */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-midnight-200 mb-2"
                >
                  确认密码 <span className="text-golden-400">*</span>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-midnight-900/50 border rounded-lg shadow-sm placeholder-midnight-500 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transition-colors duration-300 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-500/30 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    placeholder="请再次输入密码"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400 animate-slide-down">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* 注册按钮 */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 transform transition-all duration-300 ${
                    isLoading
                      ? "bg-midnight-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-400 hover:to-golden-500 hover:scale-105 hover:shadow-gold"
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
                      注册中...
                    </>
                  ) : (
                    <>
                      <span>创建账户</span>
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
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </MysticalAura>

          {/* 服务条款 */}
          <div className="text-center space-y-4">
            <p className="text-sm text-midnight-400">
              注册即表示您同意我们的服务条款和隐私政策
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">🌟</span>
                </div>
                <p className="text-xs text-midnight-500">智慧开启</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">🔮</span>
                </div>
                <p className="text-xs text-midnight-500">探索命运</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-xs text-midnight-500">获得指引</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
