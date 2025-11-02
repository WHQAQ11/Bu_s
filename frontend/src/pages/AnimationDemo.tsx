import React, { useState } from "react";
import DivinationAnimation from "@/components/ui/DivinationAnimation";
import type { DivinationResult } from "@/types/divination";

const AnimationDemo: React.FC = () => {
  const [showLiuYao, setShowLiuYao] = useState(false);
  const [showMeiHua, setShowMeiHua] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleAnimationComplete = (result: DivinationResult) => {
    console.log("Animation completed:", result);
    // 可以在这里添加完成后的处理
  };

  const handleClose = () => {
    setShowLiuYao(false);
    setShowMeiHua(false);
    setShowAI(false);
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-golden-400">占卜动画演示</h1>
          <p className="text-midnight-300 text-lg">
            点击下面的按钮来体验不同的占卜动画效果
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 六爻占卜动画 */}
          <div className="space-y-4">
            <div className="bg-midnight-800/50 rounded-xl p-6 border border-purple-500/30">
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">
                六爻占卜
              </h3>
              <p className="text-midnight-300 text-sm mb-4">
                深紫色星空背景，铜钱投掷动画，爻线生成效果
              </p>
              <button
                onClick={() => setShowLiuYao(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                播放六爻动画
              </button>
            </div>
          </div>

          {/* 梅花易数动画 */}
          <div className="space-y-4">
            <div className="bg-midnight-800/50 rounded-xl p-6 border border-cyan-500/30">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2">梅花易数</h3>
              <p className="text-midnight-300 text-sm mb-4">
                科技蓝流动背景，时间化数，卦象合成动画
              </p>
              <button
                onClick={() => setShowMeiHua(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                播放梅花动画
              </button>
            </div>
          </div>

          {/* AI解卦动画 */}
          <div className="space-y-4">
            <div className="bg-midnight-800/50 rounded-xl p-6 border border-teal-500/30">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-teal-400 mb-2">AI解卦</h3>
              <p className="text-midnight-300 text-sm mb-4">
                简洁的AI解卦动画，快速完成效果
              </p>
              <button
                onClick={() => setShowAI(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                播放AI动画
              </button>
            </div>
          </div>
        </div>

        <div className="bg-midnight-800/30 rounded-xl p-6 border border-midnight-700">
          <h3 className="text-lg font-bold text-golden-400 mb-3">动画特点</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-midnight-300">
                  六爻：15-20秒，支持跳过
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-midnight-300">
                  梅花：10-15秒，数学可视化
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-golden-400 rounded-full"></div>
                <span className="text-midnight-300">全屏沉浸式体验</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-midnight-300">响应式设计适配</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-midnight-400">
          <p>💡 提示：动画播放3秒后会显示"跳过动画"按钮</p>
        </div>
      </div>

      {/* 动画组件 */}
      <DivinationAnimation
        isOpen={showLiuYao}
        onClose={handleClose}
        onComplete={handleAnimationComplete}
        question="演示问题：我的事业发展前景如何？"
        method="liuyao"
        category="career"
      />

      <DivinationAnimation
        isOpen={showMeiHua}
        onClose={handleClose}
        onComplete={handleAnimationComplete}
        question="演示问题：我的感情发展如何？"
        method="meihua"
        category="relationship"
      />

      <DivinationAnimation
        isOpen={showAI}
        onClose={handleClose}
        onComplete={handleAnimationComplete}
        question="演示问题：我的财运如何？"
        method="ai"
        category="wealth"
      />
    </div>
  );
};

export default AnimationDemo;
