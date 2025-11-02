import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Stars, MysticalAura } from "@/components/ui/TrigramSymbol";
import { ClassicBaguaDiagram } from "@/components/ui/ClassicBagua";
import { DivinationService } from "@/services/divination";
import type { DivinationResult, AIInterpretationRequest } from "@/types/divination";


const DivinationResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [isGettingAIInterpretation, setIsGettingAIInterpretation] =
    useState(false);

  // 从路由状态获取占卜信息
  const { method, question, category, benGuaInfo, bianGuaInfo, isRealResult, apiError } = location.state || {};

  useEffect(() => {
    if (!method || !question) {
      navigate("/divination");
      return;
    }

    // 如果已经有完整的卦象信息（来自Divination.tsx），直接使用
    if (benGuaInfo) {
      console.log("✅ [DivinationResult] 接收到完整的卦象信息，直接使用");
      setResult({
        method,
        question,
        category,
        originalHexagram: '', // 需要添加必需字段
        changingLineIndexes: [], // 需要添加必需字段
        benGuaInfo,
        bianGuaInfo,
        isRealResult,
        apiError,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    // 否则，模拟占卜计算过程（兼容旧流程）
    simulateDivination();
  }, [method, question, category, benGuaInfo, navigate]);

  // 模拟占卜计算
  const simulateDivination = async () => {
    setIsLoading(true);

    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 模拟占卜结果
      const mockResult: DivinationResult = {
        method,
        question,
        category,
        originalHexagram: '111111', // 默认乾卦
        changingLineIndexes: [], // 默认无动爻
        result: generateMockResult(method),
        timestamp: new Date().toISOString(),
      };

      setResult(mockResult);
    } catch (error) {
      console.error("占卜计算失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成模拟占卜结果
  const generateMockResult = (_method: string) => {
    const hexagrams = [
      {
        name: "乾",
        number: 1,
        upper: "乾",
        lower: "乾",
        guaci: "乾：元，亨，利，贞。",
      },
      {
        name: "坤",
        number: 2,
        upper: "坤",
        lower: "坤",
        guaci: "坤：元，亨，利牝马之贞。",
      },
      {
        name: "屯",
        number: 3,
        upper: "坎",
        lower: "震",
        guaci: "屯：元，亨，利，贞。勿用有攸往，利建侯。",
      },
      {
        name: "蒙",
        number: 4,
        upper: "艮",
        lower: "坎",
        guaci: "蒙：亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。",
      },
      {
        name: "需",
        number: 5,
        upper: "坎",
        lower: "乾",
        guaci: "需：有孚，光亨，贞吉。利涉大川。",
      },
      {
        name: "讼",
        number: 6,
        upper: "乾",
        lower: "坎",
        guaci: "讼：有孚，窒。惕中吉。终凶。利见大人，不利涉大川。",
      },
      {
        name: "师",
        number: 7,
        upper: "坤",
        lower: "坎",
        guaci: "师：贞，丈人吉，无咎。",
      },
      {
        name: "比",
        number: 8,
        upper: "坎",
        lower: "坤",
        guaci: "比：吉。原筮元永贞，无咎。不宁方来，后夫凶。",
      },
    ];

    const selectedHexagram =
      hexagrams[Math.floor(Math.random() * hexagrams.length)];
    const changingYao =
      Math.random() > 0.5 ? Math.floor(Math.random() * 6) + 1 : undefined;

    return {
      name: selectedHexagram.name,
      number: selectedHexagram.number,
      upperTrigram: selectedHexagram.upper,
      lowerTrigram: selectedHexagram.lower,
      changingYao,
      interpretation: {
        guaci: selectedHexagram.guaci,
        yaoci: changingYao
          ? [`第${changingYao}爻：此爻为动爻，预示变化即将到来。`]
          : undefined,
        shiyi: "《彖》曰：此卦象征着天地间的变化与机遇，需要审慎把握时机。",
        analysis:
          "此卦象显示当前形势正处于转变的关键时刻，既有机遇也有挑战。建议保持内心的平静与专注，顺应天时，谨慎行事。",
      },
    };
  };

  // 获取AI解读
  const getAIInterpretation = async () => {
    if (!result) return;

    setIsGettingAIInterpretation(true);

    try {
      // 支持两种数据格式：新格式（benGuaInfo）和旧格式（result.result）
      const hexagramName = result.benGuaInfo?.name || result.result?.name;
      const upperTrigram = result.benGuaInfo?.shang || result.result?.upperTrigram;
      const lowerTrigram = result.benGuaInfo?.xia || result.result?.lowerTrigram;
      const guaci = result.benGuaInfo?.guaCi || result.result?.interpretation?.guaci;
      const yaoci = result.benGuaInfo?.yaoCI || result.result?.interpretation?.yaoci;
      const shiyi = result.benGuaInfo?.tuanCI || result.result?.interpretation?.shiyi;
      const analysis = result.benGuaInfo?.analysis || result.result?.interpretation?.analysis;

      // 构建请求数据（匹配后端接口格式）
      const requestData: AIInterpretationRequest = {
        method: result.method,
        question: result.question,
        hexagram_name: hexagramName || '未知卦',
        hexagram_info: {
          upperTrigram: upperTrigram || '乾',
          lowerTrigram: lowerTrigram || '乾',
          changingYao: result.benGuaInfo?.changingYao || result.result?.changingYao,
          guaci: guaci || '元亨利贞',
          yaoci: Array.isArray(yaoci) ? yaoci : yaoci ? [yaoci] : undefined,
          interpretation: shiyi || analysis || '占卜解读',
        },
        // 可选参数，根据用户问题类型设置
        focus: result.category as any || 'general',
        style: 'detailed',
        language: 'chinese',
        // Supabase边缘函数需要的参数
        log_id: `temp_${Date.now()}`, // 临时ID，实际应该从占卜记录获取
        category: result.category,
      };

      // 调用真实的AI解析API
      const response = await DivinationService.getAIInterpretation(requestData);

      if (response.success && response.data?.ai_interpretation) {
        setResult({ ...result, aiInterpretation: response.data.ai_interpretation });
      } else {
        throw new Error(response.message || "AI解析失败");
      }
    } catch (error: any) {
      console.error("获取AI解读失败:", error);

      // 显示错误信息给用户
      const errorMessage = error.message || "获取AI解析失败，请稍后重试";

      // 可以选择设置一个错误状态的解读
      const errorInterpretation = `
❌ **AI解析暂时不可用**

抱歉，在处理您的"${result.question}"问题时遇到了问题：

${errorMessage}

🔄 **建议您**
1. 稍后重试
2. 检查网络连接
3. 如果问题持续存在，请联系客服

您可以参考下方传统的卦辞解读获得指引。
      `;

      setResult({ ...result, aiInterpretation: errorInterpretation });
    } finally {
      setIsGettingAIInterpretation(false);
    }
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

  // 获取方法名称
  const getMethodName = (methodId: string): string => {
    const methods: { [key: string]: string } = {
      liuyao: "六爻占卜",
      meihua: "梅花易数",
      ai: "AI智能解卦",
    };
    return methods[methodId] || "占卜";
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
        <Stars count={30} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            <ClassicBaguaDiagram
              size="md"
              className="animate-spin-slow mx-auto"
            />
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-midnight-100">
                正在为您占卜...
              </h2>
              <p className="text-midnight-300">
                请保持内心平静，占卜需要一些时间
              </p>
              <div className="flex justify-center space-x-2">
                <div
                  className="w-3 h-3 bg-golden-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-golden-400 rounded-full animate-bounce"
                  style={{ animationDelay: "200ms" }}
                />
                <div
                  className="w-3 h-3 bg-golden-400 rounded-full animate-bounce"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染占卜结果
  if (!result) {
    return (
      <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
        <Stars count={30} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-midnight-100">占卜失败</h2>
            <p className="text-midnight-300">请重试或联系客服</p>
            <button
              onClick={() => navigate("/divination")}
              className="px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-full font-medium"
            >
              重新占卜
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      <Stars count={40} />

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* 头部信息 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent mb-4">
            占卜结果
          </h1>
          <div className="flex items-center justify-center space-x-6 text-midnight-300">
            <span className="flex items-center space-x-2">
              <span>🔮</span>
              <span>{getMethodName(result.method)}</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>📅</span>
              <span>
                {new Date(result.timestamp).toLocaleDateString("zh-CN")}
              </span>
            </span>
          </div>
        </div>

        {/* 结果状态提示 */}
        {(result.isRealResult === false || result.apiError) && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="px-4 py-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4h.01m-6.938-4h13.856c1.54 0 2.502-1.667 1.732-3.197C19.408 12.693 16.5 12 12 12s-7.408.693-7.85 2.803c-.23 1.53.192 3.197 1.732 3.197z" />
                </svg>
                <span className="text-sm text-amber-300">
                  模拟占卜结果（未保存到历史记录）{result.apiError && ` - ${result.apiError}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {result.isRealResult === true && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-300">
                  真实占卜结果（已保存到历史记录）
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 问题显示 */}
        <div className="max-w-4xl mx-auto mb-8">
          <MysticalAura className="bg-midnight-800/40 backdrop-blur-sm rounded-2xl p-6 border border-primary-500/20">
            <div className="text-center space-y-3">
              <p className="text-sm text-midnight-400">您的问题</p>
              <p className="text-xl text-midnight-100 font-medium">
                "{result.question}"
              </p>
              {category && (
                <p className="text-sm text-golden-400">
                  {getCategoryName(category)}
                </p>
              )}
            </div>
          </MysticalAura>
        </div>

        {/* 卦象展示 */}
        <div className="max-w-4xl mx-auto mb-8">
          <MysticalAura className="bg-gradient-to-br from-mystical-purple/20 to-mystical-indigo/20 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* 左侧：卦象符号 */}
              <div className="text-center space-y-6">
                <div className="relative">
                  <ClassicBaguaDiagram
                    size="sm"
                    className="mx-auto animate-spin-slow"
                  />
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-midnight-900/80 px-4 py-2 rounded-full border border-golden-400/30">
                      <span className="text-golden-400 font-bold text-xl">
                        {result.benGuaInfo?.name || result.result?.name}卦
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-midnight-300">
                    第 {result.benGuaInfo?.number || result.result?.number} 卦
                  </p>
                  <div className="flex justify-center items-center space-x-4 text-2xl">
                    <span>{result.benGuaInfo?.shang || result.result?.upperTrigram}</span>
                    <span className="text-midnight-500">上</span>
                    <span className="text-midnight-500">下</span>
                    <span>{result.benGuaInfo?.xia || result.result?.lowerTrigram}</span>
                  </div>
                  {(result.benGuaInfo?.changingYao || result.result?.changingYao) && (
                    <p className="text-golden-400">
                      第 {result.benGuaInfo?.changingYao || result.result?.changingYao} 爻动
                    </p>
                  )}
                </div>
              </div>

              {/* 右侧：卦辞解读 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-midnight-100 mb-3">
                    卦辞
                  </h3>
                  <p className="text-lg text-midnight-200 leading-relaxed font-serif">
                    {result.benGuaInfo?.guaCi || result.result?.interpretation?.guaci}
                  </p>
                </div>

                {(result.benGuaInfo?.yaoCI || result.result?.interpretation?.yaoci) && (
                  <div>
                    <h4 className="text-lg font-semibold text-midnight-100 mb-2">
                      爻辞
                    </h4>
                    <p className="text-midnight-200 leading-relaxed">
                      {typeof (result.benGuaInfo?.yaoCI || result.result?.interpretation?.yaoci) === 'string'
                        ? (result.benGuaInfo?.yaoCI || result.result?.interpretation?.yaoci)
                        : (result.benGuaInfo?.yaoCI || result.result?.interpretation?.yaoci)?.[0]}
                    </p>
                  </div>
                )}

                {(result.benGuaInfo?.tuanCI || result.result?.interpretation?.shiyi) && (
                  <div>
                    <h4 className="text-lg font-semibold text-midnight-100 mb-2">
                      彖辞
                    </h4>
                    <p className="text-midnight-200 leading-relaxed">
                      {result.benGuaInfo?.tuanCI || result.result?.interpretation?.shiyi}
                    </p>
                  </div>
                )}

                {(result.benGuaInfo?.analysis || result.result?.interpretation?.analysis) && (
                  <div>
                    <h4 className="text-lg font-semibold text-midnight-100 mb-2">
                      解说
                    </h4>
                    <p className="text-midnight-200 leading-relaxed">
                      {result.benGuaInfo?.analysis || result.result?.interpretation?.analysis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </MysticalAura>
        </div>

        {/* AI解读区域 */}
        <div className="max-w-4xl mx-auto mb-8">
          {!result.aiInterpretation ? (
            <div className="text-center">
              <button
                onClick={getAIInterpretation}
                disabled={isGettingAIInterpretation}
                className="px-8 py-4 bg-gradient-to-r from-mystical-teal to-mystical-rose text-white font-semibold rounded-full shadow-glow-lg hover:shadow-glow transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
              >
                {isGettingAIInterpretation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI正在分析中...</span>
                  </>
                ) : (
                  <>
                    <span>🤖 获取AI深度解读</span>
                    <span className="text-sm">(推荐)</span>
                  </>
                )}
              </button>
              <p className="text-sm text-midnight-400 mt-3">
                AI将结合传统智慧与现代科技为您提供个性化解读
              </p>
            </div>
          ) : (
            <MysticalAura className="bg-gradient-to-br from-mystical-teal/10 to-mystical-rose/10 backdrop-blur-sm rounded-2xl p-8 border border-mystical-teal/30">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-2xl font-bold text-midnight-100">
                    AI智能解读
                  </h3>
                  <span className="px-3 py-1 bg-mystical-teal/20 text-mystical-teal rounded-full text-sm font-medium">
                    AI分析
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div className="text-midnight-200 leading-relaxed whitespace-pre-line">
                    {result.aiInterpretation}
                  </div>
                </div>
              </div>
            </MysticalAura>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate("/divination")}
              className="px-6 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-full font-medium transition-colors duration-300 flex items-center space-x-2"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>再次占卜</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-full font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-2"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>保存记录</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-full font-medium transition-colors duration-300 flex items-center space-x-2"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>分享结果</span>
            </button>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center space-y-2 text-sm text-midnight-400">
            <p>占卜结果仅供参考，不构成任何决策建议</p>
            <p>重要决策请理性思考，结合实际情况做出判断</p>
            <p>保持积极心态，相信自己的判断能力</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivinationResult;
