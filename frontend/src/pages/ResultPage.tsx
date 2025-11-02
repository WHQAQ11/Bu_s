import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  HexagramInfo,
  getPrimaryInterpretation,
  InterpretationResult,
} from "../utils/iChingUtils";
import Layout from "@/components/Layout";

// 扩展占卜结果接口
interface ResultData {
  benGuaInfo: HexagramInfo;
  bianGuaInfo?: HexagramInfo;
  changingLineIndexes: number[]; // 动爻的索引数组 (从0开始)
  originalHexagram: number[];
  transformedHexagram?: number[];
  question: string;
  category?: string;
  method: string;
  isRealResult?: boolean; // 是否为真实API结果
  apiError?: string; // API错误信息（如果是模拟结果）
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // 从路由状态获取数据
    if (location.state) {
      const state = location.state as ResultData;
      setResultData(state);
    } else {
      setError("未找到占卜结果数据，请重新进行占卜。");
    }
  }, [location.state]);

  const handleBack = () => {
    navigate("/divination");
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 3.161-3.197.461-2.986-1.56-5.23-3.378-5.69-5.621a1.5 1.5 0 0 1 .054.044l.195.01A1.5 1.5 0 0 1 13.972 14.8a1.5 1.5 0 0 1-1.054.044 1.417 1.401A1.5 1.5 0 0 1 14.206 15.045c-1.461 3.35-3.184 5.69-5.45 5.921-.626.62-1.295.1-2.002.17a3.375 3.375 0 0 1 1.15-1.222 3.018 3.018 0 0 1 1.756-.084 3.3.215 3.3 0 0 1 2.122-.484c.946-.652 1.737-1.463 2.313-2.348a3.375 3.375 0 0 1 .665-1.412c1.117.45 2.338.362 3.018.49a3.375 3.375 0 0 1 1.5.056c.826.1 1.66.054 2.3.163.162.17.86.326.52.655.1 1.328.255 1.954.409.1.25.207.244.377.475a3.375 3.375 0 0 1 .564-1.473 3.612 3.612 0 0 1 .545-2.628 4.5 4.5 0 0 1-1.347 3.294A75.757 75.757 0 0 0 5.256 7.21c.448.382.98.637 1.56.697l1.434-1.433c.615-.365 1.379-.71 2.306-.71 1.753 0 3.586.002 5.383.007.12.005.243.012.349.021a75.14 75.14 0 0 1 12.764-6.315c.586-.45 1.16-.88 1.734-1.33A69.48 69.48 0 0 0 21.75-36.76c.3-1.48.9-3.098 1.639-4.56l.749-.749a75.37 75.37 0 0 1 1.127-.33c1.348-.448 2.726-.846 4.062-1.231.13-.032.26-.06.377-.09.137a75.57 75.57 0 0 1 12.21-6.697c.345-.46.653-1.007-.92-1.175-.495a75.37 75.37 0 0 1 1.167.32A75.17 75.17 0 0 1 17.654 15.21c1.16.63 2.477 1.29 3.886 1.85a75.49 75.49 0 0 1 6.532 2.343c.777.18 1.554.4 2.334.6a75.53 75.53 0 0 1 3.23.06c.384.264.767.55 1.154.825l.157.009c.077.005.153.018.22.037A75.59 75.59 0 0 1 1.042 1.526 5.4 5.4 0 0 1-1.89 2.404c-.764.665-1.516 1.332-2.194 1.996a75.614 75.614 0 0 1-2.08 1.527 7.33 7.33 0 0 1-2.07 1.527c-.34.05-.68.072-1.35.206-2.001.572-1.311.467-2.61.894-3.881 1.324l-.218.084c-.426.166-.85.338-1.283.494a75.68 75.68 0 0 1-3.06 1.197 9.3 9.3 0 0 1-3.06 1.197 3.415 3.415 0 0 1-1.28-.494 3.876-1.123l.13-.012c-.764-.068-1.53-.14-2.298-.221a75.696 75.696 0 0 1-3.595-2.059 9.7 9.7 0 0 1-3.595 2.059c-.752.433-1.496.915-2.228 1.38a75.696 75.696 0 0 1-3.59 2.058c-.753.434-1.501.9-2.228 1.38-.326.148-.673.296-1.021.44l-.044.019c-.657.296-1.321.591-1.979.888a75.748 75.748 0 0 1 0-7.5 0 10.5 10.5 0 0 0 0 0 10.5 10.5 0 0 0 0 10.5 10.5 0 0 0 0-7.5 0 10.5-10.5 0 0 0 0-10.5-10.5 0 0 0 0-10.5-10.5 0 0 0 0-10.5 10.5 0 0 0 0 10.5 10.5 0 0 0 0 10.5-10.5 0 0 0 0 10.5-10.5 0 0 0 0-7.5 0 10.5-10.5 0 0 0 0-10.5-10.5 0 0 0 0-10.5 10.5 0 0 0 0 10.5 10.5 0 0 0 0 7.5 0 10.5 10.5 0 0 0 0 10.5-10.5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              数据加载失败
            </h2>
            <p className="text-midnight-300 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg border border-midnight-600 hover:border-midnight-500 transition-colors"
            >
              返回占卜页
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!resultData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-amber-400/20 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-8 h-8 text-amber-400"
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
            </div>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              加载中...
            </h2>
            <p className="text-midnight-300">正在准备占卜结果...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    benGuaInfo,
    bianGuaInfo,
    changingLineIndexes,
    question,
    category,
    originalHexagram,
  } = resultData;

  // 计算本次占卜的核心解读
  const coreInterpretation: InterpretationResult = getPrimaryInterpretation(
    benGuaInfo,
    bianGuaInfo,
    changingLineIndexes,
    originalHexagram,
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
        {/* 页面标题和状态区域 */}
        <div className="border-b border-midnight-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-midnight-300 hover:text-amber-400 transition-colors"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>返回占卜</span>
                </button>
                <h1 className="text-xl font-bold text-midnight-100">
                  占卜结果解读
                </h1>
              </div>

              {/* 结果状态提示 */}
              {resultData.isRealResult === false && (
                <div className="px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.197C19.408 12.693 16.5 12 12 12s-7.408.693-7.85 2.803c-.23 1.53.192 3.197 1.732 3.197z" />
                    </svg>
                    <span className="text-sm text-amber-300">
                      模拟占卜结果（未保存到历史记录）
                      {resultData.apiError && ` - ${resultData.apiError}`}
                    </span>
                  </div>
                </div>
              )}

              {resultData.isRealResult === true && (
                <div className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-300">
                      真实占卜结果（已保存到历史记录）
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 用户问题显示 */}
          <div className="mb-8 text-center">
            <h2 className="text-lg font-medium text-amber-400 mb-2">
              您的问题
            </h2>
            <p className="text-xl text-midnight-200">{question}</p>
            {category && (
              <span className="inline-block px-3 py-1 bg-midnight-700 text-midnight-300 rounded-full text-sm">
                {category}
              </span>
            )}
          </div>

          {/* 核心解读区：最醒目位置显示 */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-amber-900/60 to-midnight-800/60 rounded-2xl p-8 border border-amber-500/40 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-amber-400/30 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h2 className="text-2xl font-bold text-amber-300">
                    核心指引
                  </h2>
                </div>

                <div className="bg-midnight-900/40 rounded-xl p-6 border border-amber-500/20">
                  <h3 className="text-xl font-semibold text-amber-200 mb-4">
                    {coreInterpretation.title}
                  </h3>
                  <p className="text-3xl font-serif text-amber-100 leading-relaxed quote">
                    "{coreInterpretation.text}"
                  </p>
                  {coreInterpretation.yaoPosition && (
                    <p className="text-sm text-amber-300 mt-4">
                      爻位：{coreInterpretation.yaoPosition}
                    </p>
                  )}
                </div>

                <div className="text-sm text-amber-300 space-y-2">
                  <p>📖 这是对您问题的直接回答</p>
                  <p>🎯 请重点关注其中的指引和建议</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI智慧解读区：中等突出 */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-mystical-purple/30 to-midnight-800/50 rounded-xl p-6 border border-mystical-purple/30">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-mystical-purple/30 rounded-full flex items-center justify-center">
                    <span className="text-lg">🧠</span>
                  </div>
                  <h3 className="text-xl font-bold text-mystical-purple">
                    智慧解读
                  </h3>
                </div>

                <div className="text-midnight-100 leading-relaxed">
                  <p className="text-lg">
                    根据"{coreInterpretation.text}"这句核心指引， 针对您关于
                    <span className="text-amber-300 font-medium">
                      {question}
                    </span>
                    的问题：
                  </p>
                  <div className="mt-4 p-4 bg-midnight-700/30 rounded-lg border-l-4 border-mystical-purple">
                    <p className="text-midnight-200">
                      这个占卜结果提示您要密切关注事物发展的关键节点。
                      {coreInterpretation.sourceGua === "ben"
                        ? "当前的状况"
                        : "未来的发展"}
                      需要您以智慧和耐心来应对。
                      建议您深入思考这句指引的含义，结合实际情况做出决策。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 参考信息区：作为背景信息 */}
          <div className="border-t border-midnight-700 pt-8">
            <h3 className="text-xl font-semibold text-midnight-400 mb-6 text-center">
              卦象详情参考
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 本卦信息 */}
              <div className="bg-midnight-800/30 rounded-xl p-6 border border-midnight-700">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-amber-400 mb-2">
                    {benGuaInfo.name}
                  </h4>
                  <span className="text-sm text-midnight-400">
                    本卦 (基础状况)
                  </span>
                </div>

                {/* 本卦卦辞 */}
                <div className="bg-midnight-700/30 rounded-lg p-4 mb-4">
                  <h5 className="text-sm font-medium text-amber-300 mb-2">
                    卦辞
                  </h5>
                  <p className="text-midnight-200 text-sm leading-relaxed">
                    {benGuaInfo.guaCi}
                  </p>
                </div>

                {/* 爻图显示 */}
                <div className="flex flex-col-reverse items-center space-y-reverse space-y-1">
                  {resultData.originalHexagram.map((value, index) => {
                    const isChanging = changingLineIndexes.includes(index);
                    const isYang = [7, 9].includes(value);

                    return (
                      <div
                        key={index}
                        className="w-24 h-1.5 flex items-center justify-center"
                      >
                        <div
                          className={`w-full h-full rounded-full ${
                            isYang
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gradient-to-r from-midnight-600 to-midnight-700"
                          } ${
                            isChanging
                              ? "ring-2 ring-red-400 ring-opacity-60 shadow-red-400/30"
                              : ""
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {changingLineIndexes.length > 0 && (
                  <p className="text-xs text-midnight-400 mt-3 text-center">
                    动爻：第{changingLineIndexes.map((i) => i + 1).join("、")}爻
                  </p>
                )}
              </div>

              {/* 变卦信息 */}
              {bianGuaInfo && (
                <div className="bg-midnight-800/30 rounded-xl p-6 border border-midnight-700">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-red-400 mb-2">
                      {bianGuaInfo.name}
                    </h4>
                    <span className="text-sm text-midnight-400">
                      变卦 (发展趋势)
                    </span>
                  </div>

                  {/* 变卦卦辞 */}
                  <div className="bg-midnight-700/30 rounded-lg p-4 mb-4">
                    <h5 className="text-sm font-medium text-red-300 mb-2">
                      卦辞
                    </h5>
                    <p className="text-midnight-200 text-sm leading-relaxed">
                      {bianGuaInfo.guaCi}
                    </p>
                  </div>

                  {/* 变卦爻图显示 */}
                  <div className="flex flex-col-reverse items-center space-y-reverse space-y-1">
                    {resultData.transformedHexagram?.map((value, index) => {
                      const isYang = [7, 9].includes(value);

                      return (
                        <div
                          key={index}
                          className="w-24 h-1.5 flex items-center justify-center"
                        >
                          <div
                            className={`w-full h-full rounded-full ${
                              isYang
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : "bg-gradient-to-r from-midnight-600 to-midnight-700"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center mt-3">
                    <p className="text-xs text-midnight-400">
                      {changingLineIndexes.length > 0
                        ? `由${benGuaInfo.name}变化而来`
                        : "与本卦相同"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 底部操作区域 */}
          <div className="mt-12 text-center space-y-4">
            <div className="text-midnight-400 text-sm">
              <p>
                本次占卜仅供参考，如需重要决策，建议结合实际情况和多方意见。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg border border-midnight-600 hover:border-midnight-500 transition-colors"
              >
                重新占卜
              </button>

              <Link
                to="/"
                className="px-8 py-3 bg-midnight-700 hover:bg-midnight-600 text-midnight-100 rounded-lg border border-midnight-600 hover:border-midnight-500 transition-colors text-center"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResultPage;
