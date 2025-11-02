import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./supabase/components/AuthProvider";
import { useAuthStore } from "./store/authStore";

// 初始化认证状态
useAuthStore.getState().initializeAuth();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
