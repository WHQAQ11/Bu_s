import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import LiuYaoAnimation from "./LiuYaoAnimation";
import MeiHuaAnimation from "./MeiHuaAnimation";
import { getHexagramInfo } from "../../utils/iChingUtils";
import type { DivinationResult, DivinationMethod } from "../../types/divination";

// 动画状态类型 - 内部使用，不导出常量避免兼容性问题
type AnimationStage = "preparing" | "in_progress" | "completing" | "completed";

// 动画状态常量 - 内部使用
const ANIMATION_STAGE = {
  PREPARING: "preparing" as AnimationStage,
  IN_PROGRESS: "in_progress" as AnimationStage,
  COMPLETING: "completing" as AnimationStage,
  COMPLETED: "completed" as AnimationStage,
};

// 动画组件接口
export interface AnimationComponentProps {
  onComplete: (result: DivinationResult) => void;
  question: string;
  method: DivinationMethod;
  category?: string;
  // ✨ 新增：真实占卜数据（来自API）
  realDivinationData?: {
    originalHexagram: string;
    originalHexagramArray?: number[];
    transformedHexagram?: string;
    transformedHexagramArray?: number[];
    benGuaInfo: any;
    bianGuaInfo?: any;
    changingLineIndexes?: number[];
  };
}

// 主组件Props
interface DivinationAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: DivinationResult) => void;
  question: string;
  method: DivinationMethod;
  category?: string;
  // ✨ 新增：真实占卜数据（来自API）
  realDivinationData?: {
    originalHexagram: string;
    originalHexagramArray?: number[];
    transformedHexagram?: string;
    transformedHexagramArray?: number[];
    benGuaInfo: any;
    bianGuaInfo?: any;
    changingLineIndexes?: number[];
  };
}

// 动画组件映射
const animationComponents: Record<
  DivinationMethod,
  React.ComponentType<AnimationComponentProps>
> = {
  liuyao: LiuYaoAnimation,
  meihua: MeiHuaAnimation,
  ai: () => null, // AI解卦暂不实现动画
};

export const DivinationAnimation: React.FC<DivinationAnimationProps> = ({
  isOpen,
  onClose,
  onComplete,
  question,
  method,
  category,
  realDivinationData, // ✨ 接收真实数据
}) => {
  const [stage, setStage] = useState<AnimationStage>(ANIMATION_STAGE.PREPARING);
  const [showSkip, setShowSkip] = useState(false);

  // 显示跳过按钮的延迟
  useEffect(() => {
    if (isOpen && stage === ANIMATION_STAGE.IN_PROGRESS) {
      const timer = setTimeout(() => setShowSkip(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowSkip(false);
    }
  }, [isOpen, stage]);

  // 处理动画完成
  const handleAnimationComplete = useCallback(
    (result: DivinationResult) => {
      setStage(ANIMATION_STAGE.COMPLETING);

      // 延迟显示完成状态
      setTimeout(() => {
        setStage(ANIMATION_STAGE.COMPLETED);
        setTimeout(() => {
          onComplete(result);
        }, 1000);
      }, 500);
    },
    [onComplete],
  );

  // 跳过动画 - 生成完整的模拟数据
  const handleSkip = useCallback(() => {
    console.log("⚡ [跳过动画] 用户选择跳过，生成完整模拟数据...");

    // 生成模拟卦象数据
    const originalHexagram = generateMockHexagram();

    // 计算动爻
    const changingLineIndexes: number[] = [];
    originalHexagram.forEach((value, index) => {
      if (value === 6 || value === 9) { // 老阴或老阳为动爻
        changingLineIndexes.push(index);
      }
    });

    // 计算变卦
    const transformedHexagram = originalHexagram.map((value) => {
      if (value === 6) return 9; // 老阴变老阳
      if (value === 9) return 6; // 老阳变老阴
      return value; // 少阴少阳不变
    });

    // 生成爻线信息格式供getHexagramInfo使用
    const yaoResults = originalHexagram.map((value) => ({
      value,
      isChanging: value === 6 || value === 9,
      coinResult: [], // 这里不需要真正的铜钱结果
    }));

    // 获取本卦信息
    const benGuaInfo = getHexagramInfo(yaoResults);

    // 获取变卦信息（如果有动爻）
    let bianGuaInfo = null;
    if (changingLineIndexes.length > 0) {
      const transformedYaoResults = transformedHexagram.map((value) => ({
        value,
        isChanging: false, // 变卦的爻都是静爻
        coinResult: [],
      }));
      bianGuaInfo = getHexagramInfo(transformedYaoResults);
    }

    // 生成完整的模拟结果
    const completeResult: DivinationResult = {
      method,
      originalHexagram: Array.isArray(originalHexagram) ? originalHexagram.join('') : originalHexagram,
      originalHexagramArray: Array.isArray(originalHexagram) ? originalHexagram : undefined,
      transformedHexagram: changingLineIndexes.length > 0 ?
        (Array.isArray(transformedHexagram) ? transformedHexagram.join('') : transformedHexagram) :
        (Array.isArray(originalHexagram) ? originalHexagram.join('') : originalHexagram),
      transformedHexagramArray: changingLineIndexes.length > 0 ?
        (Array.isArray(transformedHexagram) ? transformedHexagram : undefined) :
        (Array.isArray(originalHexagram) ? originalHexagram : undefined),
      changingLineIndexes,
      question,
      category,
      benGuaInfo: benGuaInfo ? {
        ...benGuaInfo,
        name: benGuaInfo.name,
        number: benGuaInfo.number || 0,
      } : undefined,
      bianGuaInfo: bianGuaInfo ? {
        ...bianGuaInfo,
        name: bianGuaInfo.name,
        number: bianGuaInfo.number || 0,
      } : undefined,
      isRealResult: false, // 明确标记为模拟结果
      timestamp: new Date().toISOString(),
    };

    console.log("🎯 [跳过动画] 生成完整模拟结果:", completeResult);
    handleAnimationComplete(completeResult);
  }, [method, question, category, handleAnimationComplete]);

  // 获取当前动画组件
  const AnimationComponent = animationComponents[method];

  // 动画开始时设置状态
  useEffect(() => {
    if (isOpen) {
      setStage(ANIMATION_STAGE.IN_PROGRESS);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // AI解卦不需要动画，直接完成
  if (method === "ai") {
    useEffect(() => {
      const timer = setTimeout(() => {
        handleSkip();
      }, 1000);
      return () => clearTimeout(timer);
    }, []);
  }

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500"
        onClick={
          stage === ANIMATION_STAGE.COMPLETED
            ? undefined
            : (e) => e.stopPropagation()
        }
      />

      {/* 动画容器 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* 跳过按钮 */}
        {showSkip && stage === ANIMATION_STAGE.IN_PROGRESS && (
          <button
            onClick={handleSkip}
            className="absolute top-8 right-8 px-4 py-2 bg-midnight-800/80 text-midnight-300 hover:text-golden-400 rounded-lg border border-midnight-600 hover:border-golden-400/30 transition-all duration-300 text-sm font-medium backdrop-blur-sm"
          >
            跳过动画
          </button>
        )}

        {/* 关闭按钮（仅在完成时显示） */}
        {stage === ANIMATION_STAGE.COMPLETED && (
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 bg-golden-400/20 hover:bg-golden-400/30 text-golden-400 rounded-full flex items-center justify-center transition-all duration-300 border border-golden-400/30"
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
        )}

        {/* 动画内容区域 */}
        <div className="relative max-w-6xl w-full">
          {/* 准备阶段 */}
          {stage === ANIMATION_STAGE.PREPARING && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-mystical-purple to-mystical-indigo rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl">🔮</span>
              </div>
              <h2 className="text-2xl font-bold text-midnight-100">准备占卜</h2>
              <p className="text-midnight-300">
                请保持内心平静，专注思考您的问题...
              </p>
            </div>
          )}

          {/* 动画进行阶段 */}
          {stage === ANIMATION_STAGE.IN_PROGRESS && method !== "ai" && (
            <div className="animate-fadeIn">
              {AnimationComponent && (
                <AnimationComponent
                  onComplete={handleAnimationComplete}
                  question={question}
                  method={method}
                  category={category}
                  realDivinationData={realDivinationData} // ✨ 传递真实数据
                />
              )}
            </div>
          )}

          {/* 完成阶段 */}
          {stage === ANIMATION_STAGE.COMPLETING && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-golden-400 to-golden-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-golden-400">占卜完成</h2>
              <p className="text-midnight-300">正在为您准备占卜结果...</p>
            </div>
          )}

          {/* 已完成阶段 */}
          {stage === ANIMATION_STAGE.COMPLETED && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-golden-400 to-golden-600 rounded-full flex items-center justify-center animate-pulse-glow">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-3xl font-bold text-golden-400">
                占卜结果已生成
              </h2>
              <p className="text-midnight-300">即将为您展示解读...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body
  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
};

// 辅助函数：生成模拟卦象
function generateMockHexagram(): number[] {
  return Array.from({ length: 6 }, () => {
    const random = Math.random();
    if (random < 0.125) return 6; // 老阴
    if (random < 0.375) return 7; // 少阳
    if (random < 0.625) return 8; // 少阴
    return 9; // 老阳
  });
}

export default DivinationAnimation;
