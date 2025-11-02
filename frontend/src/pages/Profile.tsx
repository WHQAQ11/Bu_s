import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { TaiJi, Stars, MysticalAura } from "@/components/ui/TrigramSymbol";
import { DivinationService } from "@/services/divination";

interface DivinationRecord {
  id: number;
  method: string;
  question: string;
  result: {
    name: string;
    number: number;
    upperTrigram: string;
    lowerTrigram: string;
  };
  aiInterpretation?: string;
  timestamp: string;
  category?: string;
}

interface UserStats {
  total: number;
  byMethod: { [key: string]: number };
  recentCount: number;
  favoriteMethod?: string;
  mostAskedCategory?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"overview" | "history" | "stats">(
    "overview",
  );
  const [divinationHistory, setDivinationHistory] = useState<
    DivinationRecord[]
  >([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DivinationRecord | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadUserData();

    // 监听占卜完成事件，自动刷新数据
    const handleDivinationCompleted = (event: CustomEvent) => {
      const timestamp = new Date().toISOString();
      const requestId = event.detail?.request_id || `profile_${Date.now()}`;

      console.log(`🔄 [${requestId}] Profile收到占卜完成事件:`, {
        success: event.detail?.success,
        log_id: event.detail?.log_id,
        method: event.detail?.method,
        question_preview: event.detail?.question?.substring(0, 30) + "...",
        error: event.detail?.error,
        error_type: event.detail?.error_type,
        timestamp,
        current_history_count: divinationHistory.length
      });

      if (event.detail.success) {
        console.log(`📊 [${requestId}] 占卜成功，开始自动刷新Profile数据...`);

        // 延迟一点时间确保后端数据已保存
        setTimeout(() => {
          loadUserData(requestId);
        }, 500);
      } else {
        console.warn(`⚠️ [${requestId}] 占卜失败，不刷新数据:`, {
          error: event.detail?.error,
          error_type: event.detail?.error_type
        });
      }
    };

    window.addEventListener('divination-completed', handleDivinationCompleted as EventListener);

    // 清理事件监听器
    return () => {
      window.removeEventListener('divination-completed', handleDivinationCompleted as EventListener);
    };
  }, [isAuthenticated, navigate]);

  // 加载用户数据
  const loadUserData = async (requestId?: string) => {
    const loadId = requestId || `load_${Date.now()}`;
    setIsLoading(true);

    try {
      console.log(`📊 [${loadId}] 开始加载用户真实数据...`, {
        timestamp: new Date().toISOString(),
        trigger: requestId ? "占卜完成事件" : "页面初始化",
        current_history_count: divinationHistory.length
      });

      // 检查认证状态
      const token = localStorage.getItem("token");
      console.log(`🔐 [${loadId}] 认证状态检查:`, {
        has_token: !!token,
        token_length: token?.length || 0
      });

      console.log(`📡 [${loadId}] 发起API请求...`);

      // 并行获取历史记录和统计数据
      const [historyResponse, statsResponse] = await Promise.all([
        DivinationService.getUserLogs(1, 50), // 获取前50条记录
        DivinationService.getUserStats()
      ]);

      console.log(`📥 [${loadId}] API响应接收完成:`, {
        history_has_data: !!historyResponse.data,
        history_logs_count: historyResponse.data?.length || 0,
        stats_has_data: !!statsResponse,
        stats_total: statsResponse?.totalDivinations,
        response_time: new Date().toISOString()
      });

      // 处理历史记录数据
      if (historyResponse.data) {
        const formattedHistory: DivinationRecord[] = historyResponse.data.map((log: any) => {
          // 提取卦象信息
          let result = {
            name: "未知卦",
            number: 1,
            upperTrigram: "乾",
            lowerTrigram: "乾",
          };

          if (log.raw_result?.result?.originalGua) {
            const originalGua = log.raw_result.result.originalGua;
            result = {
              name: originalGua.name || "未知卦",
              number: originalGua.number || 1,
              upperTrigram: originalGua.upperTrigram || "乾",
              lowerTrigram: originalGua.lowerTrigram || "乾",
            };
          }

          return {
            id: log.id,
            method: log.method,
            question: log.question,
            result: result,
            aiInterpretation: log.ai_interpretation || undefined,
            timestamp: log.created_at,
            category: "general" // 可以后续根据问题内容分析分类
          };
        });

        setDivinationHistory(formattedHistory);
        console.log(`✅ [${loadId}] 历史记录处理完成:`, {
          total_records: formattedHistory.length,
          previous_count: divinationHistory.length,
          new_records_added: Math.max(0, formattedHistory.length - divinationHistory.length),
          latest_record: formattedHistory[0] ? {
            id: formattedHistory[0].id,
            method: formattedHistory[0].method,
            timestamp: formattedHistory[0].timestamp,
            question_preview: formattedHistory[0].question.substring(0, 30) + "..."
          } : null,
          processing_time: new Date().toISOString()
        });
      } else {
        console.warn(`⚠️ [${loadId}] 历史记录API返回异常:`, {
          data_keys: historyResponse.data ? Object.keys(historyResponse.data) : null,
        });
        setDivinationHistory([]);
      }

      // 处理统计数据
      if (statsResponse) {
        const formattedStats: UserStats = {
          total: statsResponse.totalDivinations || 0,
          byMethod: {
            liuyao: statsResponse.methodStats?.liuyao || 0,
            meihua: statsResponse.methodStats?.meihua || 0,
            ai: statsResponse.methodStats?.ai || 0,
          },
          recentCount: statsResponse.recentCount || 0,
          favoriteMethod: Object.keys({
            liuyao: statsResponse.methodStats?.liuyao || 0,
            meihua: statsResponse.methodStats?.meihua || 0,
            ai: statsResponse.methodStats?.ai || 0,
          }).reduce((a, b) =>
            ((statsResponse.methodStats as any)?.[a] || 0) > ((statsResponse.methodStats as any)?.[b] || 0) ? a : b, "liuyao"
          ),
          mostAskedCategory: "general" // 可以后续分析问题内容
        };

        setUserStats(formattedStats);
        console.log("📈 用户统计数据:", formattedStats);
      } else {
        console.warn("⚠️ 统计数据API返回异常:", statsResponse);
        setUserStats({
          total: 0,
          byMethod: {},
          recentCount: 0
        });
      }

    } catch (error: any) {
      console.error("❌ 加载用户数据失败:", error);
      // 设置默认值以防界面崩溃
      setDivinationHistory([]);
      setUserStats({
        total: 0,
        byMethod: {},
        recentCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 获取方法名称
  const getMethodName = (methodId: string): string => {
    const methods: { [key: string]: string } = {
      liuyao: "六爻占卜",
      meihua: "梅花易数",
      ai: "AI智能解卦",
    };
    return methods[methodId] || "占卜";
  };

  // 获取分类名称
  const getCategoryName = (categoryId?: string): string => {
    const categories: { [key: string]: string } = {
      career: "事业发展",
      relationship: "感情婚姻",
      health: "健康养生",
      wealth: "财运投资",
      study: "学业考试",
      family: "家庭亲情",
    };
    return categories[categoryId || ""] || "生活问题";
  };

  // 删除占卜记录
  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('确定要删除这条占卜记录吗？此操作无法撤销。')) {
      return;
    }

    try {
      console.log(`🗑️ 删除占卜记录: ${recordId}`);
      const response = await DivinationService.deleteLog(recordId);

      if (response.success) {
        console.log('✅ 删除成功');
        // 重新加载数据
        await loadUserData();
      } else {
        console.error('❌ 删除失败:', response.message);
        alert(`删除失败: ${response.message}`);
      }
    } catch (error: any) {
      console.error('❌ 删除记录失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUserData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 获取分类图标
  const getCategoryIcon = (categoryId?: string): string => {
    const icons: { [key: string]: string } = {
      career: "💼",
      relationship: "💕",
      health: "🏥",
      wealth: "💰",
      study: "📚",
      family: "👨‍👩‍👧‍👦",
    };
    return icons[categoryId || ""] || "🔮";
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
        <Stars count={30} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-golden-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-midnight-300">加载个人数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染概览页面
  const renderOverview = () => (
    <div className="space-y-8">
      {/* 用户信息卡片 */}
      <MysticalAura className="bg-gradient-to-br from-mystical-purple/20 to-mystical-indigo/20 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/30">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center shadow-glow">
              <span className="text-4xl text-white font-bold">
                {(user?.nickname || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-golden-400 rounded-full flex items-center justify-center">
              <TaiJi size="sm" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-midnight-100 mb-2">
              {user?.nickname || "问卜者"}
            </h2>
            <p className="text-midnight-300 mb-4">{user?.email}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="px-3 py-1 bg-golden-400/20 text-golden-400 rounded-full">
                VIP会员
              </span>
              <span className="px-3 py-1 bg-mystical-teal/20 text-mystical-teal rounded-full">
                活跃用户
              </span>
            </div>
          </div>
        </div>
      </MysticalAura>

      {/* 快速统计 */}
      <div className="grid md:grid-cols-4 gap-6">
        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-golden-400 to-golden-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-golden-400">
              {userStats?.total || 0}
            </p>
            <p className="text-midnight-300">总占卜次数</p>
            <p className="text-xs text-green-400 mt-1">✨ 真实数据</p>
          </div>
        </MysticalAura>

        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
            <p className="text-3xl font-bold text-mystical-purple">
              {getMethodName(userStats?.favoriteMethod || "liuyao")}
            </p>
            <p className="text-midnight-300">常用方法</p>
          </div>
        </MysticalAura>

        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-mystical-teal to-mystical-rose rounded-full flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-mystical-teal">
              {userStats?.recentCount || 0}
            </p>
            <p className="text-midnight-300">本月占卜</p>
          </div>
        </MysticalAura>

        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">💚</span>
            </div>
            <p className="text-3xl font-bold text-green-400">7</p>
            <p className="text-midnight-300">连续签到</p>
          </div>
        </MysticalAura>
      </div>

      {/* 快捷操作 */}
      <div className="grid md:grid-cols-2 gap-6">
        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
          <h3 className="text-xl font-bold text-midnight-100 mb-4">快捷操作</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/divination")}
              className="w-full px-4 py-3 bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-lg font-medium hover:shadow-glow transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>🔮</span>
              <span>开始占卜</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className="w-full px-4 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <span>📜</span>
              <span>查看历史</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className="w-full px-4 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>统计分析</span>
            </button>
          </div>
        </MysticalAura>

        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
          <h3 className="text-xl font-bold text-midnight-100 mb-4">账户设置</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg font-medium transition-colors duration-300 text-left">
              📝 编辑个人信息
            </button>
            <button className="w-full px-4 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg font-medium transition-colors duration-300 text-left">
              🔔 通知设置
            </button>
            <button className="w-full px-4 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg font-medium transition-colors duration-300 text-left">
              🛡️ 隐私设置
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors duration-300 text-left"
            >
              🚪 退出登录
            </button>
          </div>
        </MysticalAura>
      </div>
    </div>
  );

  // 渲染占卜历史
  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-midnight-100">占卜历史</h2>
        <button
          onClick={() => navigate("/divination")}
          className="px-4 py-2 bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-lg font-medium hover:shadow-glow transition-all duration-300"
        >
          新占卜
        </button>
      </div>

      {divinationHistory.length === 0 ? (
        <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-12 border border-primary-500/20 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center">
              <span className="text-3xl">📜</span>
            </div>
            <h3 className="text-xl font-semibold text-midnight-100">
              暂无占卜记录
            </h3>
            <p className="text-midnight-300">开始您的第一次占卜之旅吧</p>
            <button
              onClick={() => navigate("/divination")}
              className="px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-full font-medium hover:shadow-glow transition-all duration-300"
            >
              开始占卜
            </button>
          </div>
        </MysticalAura>
      ) : (
        <div className="space-y-4">
          {divinationHistory.map((record) => (
            <div
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className="cursor-pointer"
            >
              <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-golden-400/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center">
                      <span className="text-xl">{record.result.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-mystical-purple/20 text-mystical-purple rounded text-xs font-medium">
                          {getMethodName(record.method)}
                        </span>
                        {record.category && (
                          <span className="flex items-center space-x-1 text-midnight-400 text-sm">
                            <span>{getCategoryIcon(record.category)}</span>
                            <span>{getCategoryName(record.category)}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-midnight-200">{record.question}</p>
                      <p className="text-sm text-midnight-500">
                        {new Date(record.timestamp).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {record.aiInterpretation && (
                      <span className="px-2 py-1 bg-mystical-teal/20 text-mystical-teal rounded text-xs font-medium">
                        AI解读
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        handleDeleteRecord(record.id.toString());
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      title="删除记录"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <svg
                      className="w-5 h-5 text-midnight-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </MysticalAura>
            </div>
          ))}
        </div>
      )}

      {/* 记录详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-midnight-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-primary-500/30">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-midnight-100 mb-2">
                    {selectedRecord.result.name}卦占卜
                  </h3>
                  <p className="text-midnight-300">{selectedRecord.question}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-midnight-400 hover:text-midnight-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-mystical-purple/20 text-mystical-purple rounded-full text-sm font-medium">
                    {getMethodName(selectedRecord.method)}
                  </span>
                  <span className="text-midnight-400 text-sm">
                    {new Date(selectedRecord.timestamp).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div className="bg-midnight-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {selectedRecord.result.name}
                      </span>
                    </div>
                    <div>
                      <p className="text-midnight-200 font-medium">
                        第{selectedRecord.result.number}卦
                      </p>
                      <p className="text-midnight-400 text-sm">
                        {selectedRecord.result.upperTrigram}上
                        {selectedRecord.result.lowerTrigram}下
                      </p>
                    </div>
                  </div>
                </div>

                {selectedRecord.aiInterpretation && (
                  <div className="bg-mystical-teal/10 rounded-lg p-4 border border-mystical-teal/30">
                    <h4 className="text-mystical-teal font-medium mb-2">
                      AI解读
                    </h4>
                    <p className="text-midnight-200 text-sm leading-relaxed">
                      {selectedRecord.aiInterpretation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染统计分析
  const renderStats = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-midnight-100">统计分析</h2>

      {/* 占卜方法分布 */}
      <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-8 border border-primary-500/20">
        <h3 className="text-xl font-semibold text-midnight-100 mb-6">
          占卜方法分布
        </h3>
        <div className="space-y-4">
          {Object.entries(userStats?.byMethod || {}).map(([method, count]) => (
            <div key={method} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-midnight-200">
                  {getMethodName(method)}
                </span>
                <span className="text-golden-400 font-medium">{count}次</span>
              </div>
              <div className="w-full bg-midnight-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-mystical-purple to-mystical-indigo h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / (userStats?.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </MysticalAura>

      {/* 最近占卜趋势 */}
      <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-8 border border-primary-500/20">
        <h3 className="text-xl font-semibold text-midnight-100 mb-6">
          最近占卜趋势
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {["一", "二", "三", "四", "五", "六", "日"].map((day, _index) => (
            <div key={day} className="text-center space-y-2">
              <p className="text-xs text-midnight-400">{day}</p>
              <div className="h-20 bg-midnight-700 rounded-lg flex items-end justify-center">
                <div
                  className="w-full bg-gradient-to-t from-mystical-purple to-mystical-indigo rounded-lg transition-all duration-300"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </MysticalAura>

      {/* 热门问题类型 */}
      <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-xl p-8 border border-primary-500/20">
        <h3 className="text-xl font-semibold text-midnight-100 mb-6">
          热门问题类型
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { category: "career", count: 8, icon: "💼" },
            { category: "relationship", count: 6, icon: "💕" },
            { category: "wealth", count: 4, icon: "💰" },
            { category: "health", count: 3, icon: "🏥" },
            { category: "study", count: 2, icon: "📚" },
            { category: "family", count: 1, icon: "👨‍👩‍👧‍👦" },
          ].map((item) => (
            <div
              key={item.category}
              className="flex items-center space-x-3 bg-midnight-700/50 rounded-lg p-3"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-midnight-200">
                  {getCategoryName(item.category)}
                </p>
                <p className="text-sm text-midnight-400">{item.count}次</p>
              </div>
            </div>
          ))}
        </div>
      </MysticalAura>
    </div>
  );

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      <Stars count={30} />

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent mb-4">
              个人中心
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-midnight-400 hover:text-golden-400 hover:rotate-180 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="刷新数据"
            >
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-midnight-300">管理您的占卜记录和个人信息</p>
          {(isLoading || isRefreshing) && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className="w-4 h-4 border-2 border-golden-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-golden-400">
                {isLoading ? "正在加载真实数据..." : "正在刷新数据..."}
              </p>
            </div>
          )}
        </div>

        {/* 标签页导航 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-midnight-800/50 backdrop-blur-sm rounded-full p-1 border border-primary-500/20">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white shadow-glow"
                  : "text-midnight-300 hover:text-midnight-100"
              }`}
            >
              📊 概览
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white shadow-glow"
                  : "text-midnight-300 hover:text-midnight-100"
              }`}
            >
              📜 历史
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "stats"
                  ? "bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white shadow-glow"
                  : "text-midnight-300 hover:text-midnight-100"
              }`}
            >
              📈 统计
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="animate-fadeIn">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "history" && renderHistory()}
          {activeTab === "stats" && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
