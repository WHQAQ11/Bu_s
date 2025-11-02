import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Stars } from "@/components/ui/TrigramSymbol";
import { ClassicTaiJi } from "@/components/ui/ClassicBagua";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动状态
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 关闭移动端菜单当路由改变时
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  };

  // 导航链接配置
  const navigationLinks = [
    { path: "/", label: "首页", icon: "🏠" },
    ...(isAuthenticated
      ? [
          { path: "/divination", label: "占卜", icon: "🔮" },
          { path: "/profile", label: "个人中心", icon: "👤" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-midnight-900">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-midnight-800/95 backdrop-blur-lg border-b border-primary-500/30 shadow-glow-lg"
            : "bg-midnight-800/90 backdrop-blur-md border-b border-primary-500/20 shadow-glow"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <ClassicTaiJi
                size={50}
                className="animate-spin-slow group-hover:animate-spin"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent group-hover:from-golden-300 group-hover:to-golden-500 transition-all duration-300">
                  每日一卦
                </h1>
                <p className="text-xs text-midnight-400 hidden md:block">
                  探索智慧，指引人生
                </p>
              </div>
            </Link>

            {/* 导航菜单 */}
            <div className="flex items-center space-x-6">
              {/* 主要导航链接 - 桌面端 */}
              <div className="hidden md:flex space-x-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-midnight-200 hover:text-golden-400 transition-colors duration-300 relative group flex items-center space-x-2 ${
                      location.pathname === link.path ? "text-golden-400" : ""
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-golden-400 transition-all duration-300 ${
                        location.pathname === link.path
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                ))}
              </div>

              {/* 用户认证区域 */}
              <div className="flex items-center space-x-4">
                {isAuthenticated && user ? (
                  /* 已登录状态 */
                  <div className="flex items-center space-x-4">
                    {/* 用户信息 */}
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-midnight-100">
                        {user.nickname || user.email}
                      </p>
                      <p className="text-xs text-golden-400">
                        欢迎回来，问卜者
                      </p>
                    </div>

                    {/* 用户头像 */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center shadow-mystical">
                        <span className="text-white text-sm font-bold">
                          {(user.nickname || user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-golden-400 rounded-full animate-pulse"></div>
                    </div>

                    {/* 退出登录按钮 */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="text-midnight-400 hover:text-red-400 transition-colors duration-300 disabled:opacity-50 p-2 rounded-lg hover:bg-red-400/10"
                      title="退出登录"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* 未登录状态 */
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="text-midnight-300 hover:text-golden-400 font-medium transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-midnight-700/50"
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white px-4 py-2 rounded-full font-medium shadow-glow hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      注册
                    </Link>
                  </div>
                )}
              </div>

              {/* 移动端菜单按钮 */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-midnight-300 hover:text-golden-400 p-2 rounded-lg hover:bg-midnight-700/50 transition-colors duration-300"
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-midnight-700 bg-midnight-800/95 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* 移动端导航链接 */}
              <div className="space-y-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                      location.pathname === link.path
                        ? "bg-mystical-purple/20 text-golden-400 border-l-4 border-golden-400"
                        : "text-midnight-200 hover:bg-midnight-700/50 hover:text-golden-400"
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* 移动端用户区域 */}
              <div className="border-t border-midnight-700 pt-4">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    {/* 用户信息 */}
                    <div className="flex items-center space-x-3 px-4 py-3 bg-midnight-700/30 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {(user.nickname || user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-midnight-100">
                          {user.nickname || user.email}
                        </p>
                        <p className="text-xs text-golden-400">
                          欢迎回来，问卜者
                        </p>
                      </div>
                    </div>

                    {/* 退出登录按钮 */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors duration-300 disabled:opacity-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>退出登录</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-3 text-midnight-300 hover:text-golden-400 font-medium bg-midnight-700/50 hover:bg-midnight-700 rounded-lg transition-colors duration-300"
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-full font-medium shadow-glow hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      注册
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-divination-pattern opacity-30"></div>
        <Stars count={30} />

        {/* 主要内容 */}
        <div className="relative z-10">{children}</div>
      </main>

      <footer className="bg-midnight-950 border-t border-primary-500/20 text-midnight-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* 品牌信息 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ClassicTaiJi size={30} />
                <h3 className="text-lg font-semibold text-golden-400">
                  每日一卦
                </h3>
              </div>
              <p className="text-sm text-midnight-400 leading-relaxed">
                融合中华古老智慧与现代AI技术，为探索人生提供智慧指引。
              </p>
            </div>

            {/* 快速链接 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-midnight-200 uppercase tracking-wider">
                探索
              </h4>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/divination"
                      className="block text-sm text-midnight-400 hover:text-golden-400 transition-colors"
                    >
                      开始占卜
                    </Link>
                    <Link
                      to="/profile"
                      className="block text-sm text-midnight-400 hover:text-golden-400 transition-colors"
                    >
                      个人中心
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-sm text-midnight-400 hover:text-golden-400 transition-colors"
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      className="block text-sm text-midnight-400 hover:text-golden-400 transition-colors"
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 联系信息 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-midnight-200 uppercase tracking-wider">
                关于
              </h4>
              <div className="space-y-2 text-sm text-midnight-400">
                <p>基于《周易》智慧</p>
                <p>AI 驱动的个性化解读</p>
                <p>传承中华传统文化</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-midnight-800">
            <div className="text-center">
              <p className="text-sm text-midnight-500">
                &copy; 2024 每日一卦. All rights reserved.
              </p>
              <p className="text-xs text-midnight-600 mt-2">
                天行健，君子以自强不息；地势坤，君子以厚德载物。
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
