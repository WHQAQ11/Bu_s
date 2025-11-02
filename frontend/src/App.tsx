import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Divination from "@/pages/Divination";
import DivinationResult from "@/pages/DivinationResult";
import ResultPage from "@/pages/ResultPage";
import Profile from "@/pages/Profile";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import BaguaPage from "@/pages/BaguaPage";
import AnimationDemo from "@/pages/AnimationDemo";
import { useAuthStore } from "@/store/authStore";
import "./App.css";

function AppContent() {
  const { initializeAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  // 初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 监听认证过期事件
  useEffect(() => {
    const handleAuthExpired = (event: CustomEvent) => {
      console.log('🔐 收到认证过期事件:', event.detail);
      logout();
      navigate('/login');
      // 显示用户友好的提示
      if (event.detail?.message) {
        alert(event.detail.message);
      }
    };

    window.addEventListener('auth-expired', handleAuthExpired as EventListener);

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired as EventListener);
    };
  }, [logout, navigate]);

  return (
    <Routes>
      {/* 八卦图页面 - 不使用Layout组件 */}
      <Route path="/bagua" element={<BaguaPage />} />

      {/* 其他页面使用Layout组件 */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/divination" element={<Divination />} />
              <Route
                path="/divination/result"
                element={<DivinationResult />}
              />
              <Route
                path="/divination/result-page"
                element={<ResultPage />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/animation-demo" element={<AnimationDemo />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;