import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimationComponentProps } from "./DivinationAnimation";
import YaoSymbol from "./YaoSymbol";
import {
  getHexagramInfo,
  calculateBianGuaLines,
} from "../../utils/iChingUtils";

// 铜钱结果接口
interface CoinResult {
  isHeads: boolean; // true为文字面(背)，false为图案面(正)
  rotation: number;
  x: number;
  y: number;
}

/*
传统六爻占卜铜钱卦法说明：
- 铜钱有文字面为"背"，图案面为"正"
- 三枚铜钱投掷结果：
  * 三背（零正三背）：老阳（9）- 动爻
  * 一正二背：少阴（8）- 静爻
  * 二正一背：少阳（7）- 静爻
  * 三正（三正零背）：老阴（6）- 动爻

此规则遵循京氏易传的传统占卜方法，与后世通行的规则一致。
*/

// 爻线信息接口
interface YaoInfo {
  value: number; // 6(老阴), 7(少阳), 8(少阴), 9(老阳)
  isChanging: boolean; // 是否为动爻
  coinResult: CoinResult[];
}

// 六爻动画阶段
enum LiuYaoStage {
  COIN_TOSS = "coin_toss", // 铜钱投掷
  YAO_BUILDING = "yao_building", // 爻线构建
  TRANSFORMATION = "transformation", // 变卦转换
  COMPLETED = "completed", // 完成
}

export const LiuYaoAnimation: React.FC<AnimationComponentProps> = ({
  question,
  category,
}) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<LiuYaoStage>(LiuYaoStage.COIN_TOSS);
  const [currentRound, setCurrentRound] = useState(0);
  const [coins, setCoins] = useState<CoinResult[]>([]);
  const [yaoResults, setYaoResults] = useState<YaoInfo[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // 卦名状态
  const [benGuaName, setBenGuaName] = useState<string>("");
  const [bianGuaName, setBianGuaName] = useState<string>("");

  // 变卦数据状态
  const [bianGuaLines, setBianGuaLines] = useState<YaoInfo[]>([]);

  // 生成随机铜钱结果
  const generateCoinResult = useCallback((): CoinResult[] => {
    return Array.from({ length: 3 }, (_, i) => ({
      isHeads: Math.random() < 0.5,
      rotation: Math.random() * 1440, // 增加旋转圈数以配合3D动画
      x: (i - 1) * 120 + (Math.random() - 0.5) * 40, // 添加随机偏移
      y: Math.random() * 20 - 10, // 添加随机垂直偏移
    }));
  }, []);

  // 根据铜钱结果计算爻值（遵循传统六爻占卜古法）
  const calculateYaoValue = useCallback(
    (coinResult: CoinResult[]): { value: number; isChanging: boolean } => {
      const headsCount = coinResult.filter((coin) => coin.isHeads).length;

      switch (headsCount) {
        case 0: // 三背（零正三背）- 老阳（9）
          return { value: 9, isChanging: true };
        case 1: // 一正二背 - 少阴（8）
          return { value: 8, isChanging: false };
        case 2: // 二正一背 - 少阳（7）
          return { value: 7, isChanging: false };
        case 3: // 三正（三正零背）- 老阴（6）
          return { value: 6, isChanging: true };
        default:
          return { value: 7, isChanging: false };
      }
    },
    [],
  );

  // 执行铜钱投掷动画
  const performCoinToss = useCallback(async () => {
    setIsAnimating(true);

    // 生成新的铜钱结果
    const newCoins = generateCoinResult();
    setCoins(newCoins);

    // 模拟铜钱旋转动画时间
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // 计算爻值
    const yaoInfo = calculateYaoValue(newCoins);
    const newYaoResults = [...yaoResults, { ...yaoInfo, coinResult: newCoins }];
    setYaoResults(newYaoResults);

    // 动画间隔
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsAnimating(false);

    // 检查是否完成6次投掷
    if (currentRound < 5) {
      setCurrentRound((prev) => prev + 1);
    } else {
      // 所有爻线构建完成，进入变卦阶段
      setStage(LiuYaoStage.YAO_BUILDING);
      setTimeout(() => {
        setStage(LiuYaoStage.TRANSFORMATION);
      }, 2000);
    }
  }, [currentRound, generateCoinResult, calculateYaoValue, yaoResults]);

  // 自动开始投掷
  useEffect(() => {
    if (stage === LiuYaoStage.COIN_TOSS && !isAnimating) {
      const timer = setTimeout(() => {
        performCoinToss();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage, currentRound, isAnimating, performCoinToss]);

  // 处理变卦完成
  useEffect(() => {
    if (stage === LiuYaoStage.TRANSFORMATION) {
      // 计算本卦和变卦的卦名
      if (yaoResults.length === 6) {
        // 计算本卦卦名
        const benGuaInfo = getHexagramInfo(yaoResults);
        setBenGuaName(benGuaInfo?.name || "未知卦");

        // 使用正确的变卦计算函数
        const calculatedBianGuaLines = calculateBianGuaLines(yaoResults);
        setBianGuaLines(
          calculatedBianGuaLines.map((yao) => ({
            ...yao,
            coinResult: [], // 为兼容性添加空的coinResult数组
          })),
        );

        // 计算变卦卦名
        const bianGuaInfo = getHexagramInfo(calculatedBianGuaLines);
        setBianGuaName(bianGuaInfo?.name || "未知卦");
      }

      const timer = setTimeout(() => {
        setStage(LiuYaoStage.COMPLETED);

        // 生成最终结果数据
        const originalHexagram = yaoResults.map((yao) => yao.value);
        const transformedHexagram = yaoResults.map((yao) => {
          if (yao.isChanging) {
            return yao.value === 6 ? 9 : 6; // 老阴变老阳，老阳变老阴
          }
          return yao.value;
        });

        const changingLineIndexes = yaoResults
          .map((yao, index) => (yao.isChanging ? index : -1))
          .filter((index) => index >= 0);

        // 导航到结果页面，传递完整数据
        setTimeout(() => {
          navigate("/divination/result-page", {
            state: {
              benGuaInfo: getHexagramInfo(yaoResults),
              bianGuaInfo: getHexagramInfo(bianGuaLines),
              changingLineIndexes,
              originalHexagram,
              transformedHexagram,
              question,
              category,
              method: "liuyao",
            },
          });
        }, 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, yaoResults, navigate, question, category, bianGuaLines]);

  // 渲染铜钱组件
  const renderCoin = (coin: CoinResult, index: number) => {
    // 为每个铜钱创建独特的动画延迟
    const animationDelay = index * 0.2;
    // 随机化动画持续时间，增加真实感
    const animationDuration = 2.5 + Math.random() * 0.5;

    return (
      <div
        key={index}
        className="absolute transition-all duration-1000 preserve-3d gpu-accelerated"
        style={{
          transform: `translate(${coin.x}px, ${coin.y}px) rotateZ(${coin.rotation}deg)`,
          animation: isAnimating
            ? `coin-flip-3d ${animationDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${animationDelay}s, coin-toss-arc ${animationDuration}s ease-in-out ${animationDelay}s, coin-bounce 0.8s ease-out ${animationDuration + 0.2}s`
            : "none",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          perspective: 1000,
        }}
      >
        <div className="relative w-20 h-20 chinese-coin-container-3d" style={{ transformStyle: "preserve-3d" }}>
          {/* 铜钱厚度侧面 - 增强立体感 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: coin.isHeads
                ? "linear-gradient(135deg, #b45309 0%, #92400e 50%, #78350f 100%)"
                : "linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%)",
              transform: "translateZ(-2px)",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)"
            }}
          ></div>

          {/* 铜钱主体 - 3D金属质感 */}
          <div
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden ${
              coin.isHeads
                ? "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800"
                : "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900"
            }`}
            style={{
              boxShadow: `
                   inset 0 3px 6px rgba(0,0,0,0.4),
                   inset 0 -3px 6px rgba(255,255,255,0.15),
                   0 12px 24px rgba(0,0,0,0.5),
                   0 6px 12px rgba(0,0,0,0.3),
                   0 0 0 1px rgba(139,69,19,0.4),
                   0 0 0 3px rgba(160,82,45,0.3),
                   0 0 20px rgba(217,119,6,0.2)
                 `,
              background: coin.isHeads
                ? `
                     radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0%, transparent 45%),
                     radial-gradient(circle at 75% 75%, rgba(0,0,0,0.25) 0%, transparent 45%),
                     radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%),
                     linear-gradient(135deg, #d97706 0%, #b45309 20%, #92400e 40%, #78350f 60%, #451a03 100%)
                     `
                : `
                     radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, transparent 40%),
                     radial-gradient(circle at 65% 65%, rgba(0,0,0,0.35) 0%, transparent 40%),
                     radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%),
                     linear-gradient(135deg, #b45309 0%, #92400e 25%, #78350f 45%, #451a03 100%)
                     `,
            }}
          >
            {/* 铜锈和做旧效果 */}
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `
                     radial-gradient(circle at 15% 15%, transparent 30%, rgba(139,69,19,0.1) 60%),
                     radial-gradient(circle at 85% 85%, transparent 30%, rgba(160,82,45,0.1) 60%),
                     radial-gradient(circle at 50% 10%, rgba(184,134,11,0.05) 0%, transparent 40%),
                     radial-gradient(circle at 20% 80%, rgba(139,69,19,0.08) 0%, transparent 50%)
                   `,
              }}
            ></div>

            {/* 方孔 - 真实镂空3D效果 */}
            <div
              className="absolute w-6 h-6"
              style={{
                background: "transparent",
                boxShadow: `
                     inset 0 0 0 2px rgba(0,0,0,0.9),
                     inset 0 0 0 4px rgba(0,0,0,0.7),
                     0 0 0 1px rgba(139,69,19,0.8),
                     0 0 0 2px rgba(160,82,45,0.6),
                     0 2px 4px rgba(0,0,0,0.5),
                     0 4px 8px rgba(0,0,0,0.3)
                   `,
                transform: "translateZ(1px)",
                border: "2px solid rgba(139,69,19,0.6)",
                borderRadius: "2px"
              }}
            ></div>

            {/* 方孔内壁深度效果 */}
            <div
              className="absolute w-4 h-4"
              style={{
                top: "8px",
                left: "8px",
                background: "rgba(15,23,42,0.95)",
                transform: "translateZ(1px)",
                boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)"
              }}
            ></div>

            {/* 正面文字 - 招財進寶四字环绕布局 */}
            {coin.isHeads && (
              <div className="absolute inset-0">
                {/* 上方 - 進 */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div
                    className="text-amber-100 font-bold text-sm leading-none select-none"
                    style={{
                      fontFamily: "'KaiTi', 'STKaiti', serif",
                      textShadow: `
                           0 1px 2px rgba(0,0,0,0.8),
                           0 0 4px rgba(217,119,6,0.3),
                           inset 0 1px 1px rgba(255,255,255,0.2)
                         `,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
                    }}
                  >
                    進
                  </div>
                </div>

                {/* 下方 - 寶 */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div
                    className="text-amber-100 font-bold text-sm leading-none select-none"
                    style={{
                      fontFamily: "'KaiTi', 'STKaiti', serif",
                      textShadow: `
                           0 1px 2px rgba(0,0,0,0.8),
                           0 0 4px rgba(217,119,6,0.3),
                           inset 0 1px 1px rgba(255,255,255,0.2)
                         `,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
                    }}
                  >
                    寶
                  </div>
                </div>

                {/* 左方 - 招 */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <div
                    className="text-amber-100 font-bold text-sm leading-none select-none"
                    style={{
                      fontFamily: "'KaiTi', 'STKaiti', serif",
                      textShadow: `
                           0 1px 2px rgba(0,0,0,0.8),
                           0 0 4px rgba(217,119,6,0.3),
                           inset 0 1px 1px rgba(255,255,255,0.2)
                         `,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
                    }}
                  >
                    招
                  </div>
                </div>

                {/* 右方 - 財 */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div
                    className="text-amber-100 font-bold text-sm leading-none select-none"
                    style={{
                      fontFamily: "'KaiTi', 'STKaiti', serif",
                      textShadow: `
                           0 1px 2px rgba(0,0,0,0.8),
                           0 0 4px rgba(217,119,6,0.3),
                           inset 0 1px 1px rgba(255,255,255,0.2)
                         `,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
                    }}
                  >
                    財
                  </div>
                </div>
              </div>
            )}

            {/* 背面纹饰 - 传统八卦图案 */}
            {!coin.isHeads && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  {/* 太极图主体 */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* 阴阳两半 */}
                    <div className="absolute inset-0 flex">
                      {/* 左半圆 - 阴（黑色） */}
                      <div
                        className="w-1/2 h-full bg-amber-900/80"
                        style={{
                          clipPath: "ellipse(100% 50% at 0% 50%)",
                          background: "linear-gradient(90deg, #451a03 0%, #92400e 100%)"
                        }}
                      ></div>
                      {/* 右半圆 - 阳（金色） */}
                      <div
                        className="w-1/2 h-full bg-amber-400/80"
                        style={{
                          clipPath: "ellipse(100% 50% at 100% 50%)",
                          background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)"
                        }}
                      ></div>
                    </div>

                    {/* 阴中阳点 */}
                    <div
                      className="absolute w-3 h-3 bg-amber-400/90 rounded-full"
                      style={{
                        top: "25%",
                        left: "25%",
                        background: "radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)",
                        boxShadow: "0 0 4px rgba(251, 191, 36, 0.5)"
                      }}
                    ></div>

                    {/* 阳中阴点 */}
                    <div
                      className="absolute w-3 h-3 bg-amber-900/90 rounded-full"
                      style={{
                        top: "25%",
                        right: "25%",
                        background: "radial-gradient(circle, #92400e 0%, #451a03 100%)",
                        boxShadow: "0 0 4px rgba(146, 64, 14, 0.5)"
                      }}
                    ></div>
                  </div>

                  {/* 八卦符号环绕 */}
                  {/* 乾卦（上） */}
                  <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-amber-600/70"
                    style={{ marginTop: "-4px" }}
                  ></div>
                  <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-amber-600/70"
                    style={{ marginTop: "-7px" }}
                  ></div>

                  {/* 坤卦（下） */}
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-amber-600/70"
                    style={{ marginBottom: "-4px" }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-amber-600/70"
                    style={{ marginBottom: "-7px" }}
                  ></div>

                  {/* 离卦（左） */}
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-amber-600/70"
                    style={{ marginLeft: "-4px" }}
                  ></div>
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-2 bg-amber-600/70"
                    style={{ marginLeft: "-7px" }}
                  ></div>

                  {/* 坎卦（右） */}
                  <div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-amber-600/70"
                    style={{ marginRight: "-4px" }}
                  ></div>
                  <div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-2 bg-amber-600/70"
                    style={{ marginRight: "-7px" }}
                  ></div>

                  {/* 四角装饰纹 */}
                  <div
                    className="absolute top-1 left-1 w-1 h-1 rounded-full bg-amber-500/60"
                  ></div>
                  <div
                    className="absolute top-1 right-1 w-1 h-1 rounded-full bg-amber-500/60"
                  ></div>
                  <div
                    className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-amber-500/60"
                  ></div>
                  <div
                    className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-amber-500/60"
                  ></div>
                </div>
              </div>
            )}

            {/* 金属光泽和镜面反射 */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `
                     radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0%, transparent 20%),
                     radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 15%),
                     linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%),
                     linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.05) 55%, transparent 65%)
                   `,
                mixBlendMode: "overlay",
              }}
            ></div>

            {/* 边缘高光和立体边缘 */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "2px solid transparent",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%) border-box",
                WebkitMask:
                  "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            ></div>
          </div>

          {/* 动态光晕效果 */}
          {isAnimating && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 70%)",
                filter: "blur(8px)",
                transform: "scale(1.2)",
              }}
            ></div>
          )}
        </div>
      </div>
    );
  };

  // 渲染爻线
  const renderYao = (
    yao: YaoInfo,
    index: number,
    isTransformed: boolean = false,
  ) => {
    // 步骤1: 状态计算逻辑 (完全保留，未作任何改动)
    const isChanging = yao.isChanging && stage === LiuYaoStage.TRANSFORMATION;
    let actualValue = yao.value;
    if (isTransformed && yao.isChanging) {
      actualValue = yao.value === 6 ? 9 : 6; // 老阴变老阳，老阳变老阴
    }

    // 步骤2: Props准备 (将计算结果转化为给新组件的清晰指令)
    const symbolType = [7, 9].includes(yao.value) ? "yang" : "yin";
    const symbolColor = [7, 8].includes(actualValue) ? "amber" : "red";

    // 步骤3: 渲染 (将指令传递给新组件，自身不再关心具体实现)
    // 注意：最外层的div容器及其样式完全保留，确保布局和动画间隔不受影响。
    return (
      <div key={index} className={`w-48 h-3 mb-2 transition-all duration-1000`}>
        <YaoSymbol
          type={symbolType}
          color={symbolColor}
          isChanging={isChanging}
          intensity={isChanging ? 1.2 : 1}
        />
      </div>
    );
  };

  return (
    <div className="text-center space-y-8">
      {/* 标题 */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          六爻占卜
        </h2>
        <p className="text-midnight-300">三枚铜钱定乾坤，六次投揭示天机</p>
      </div>

      {/* 铜钱投掷阶段 */}
      {stage === LiuYaoStage.COIN_TOSS && (
        <div className="space-y-8">
          <div className="text-midnight-200">
            <p className="text-lg">第 {currentRound + 1} 次投掷</p>
            <p className="text-sm text-midnight-400">
              请静心观想，铜钱即将落下...
            </p>
          </div>

          {/* 铜钱显示区域 */}
          <div className="relative h-40 flex items-center justify-center">
            {coins.map((coin, index) => renderCoin(coin, index))}
          </div>

          {/* 当前结果显示 */}
          {yaoResults.length > currentRound && (
            <div className="space-y-2">
              <p className="text-golden-400 font-medium">
                第 {currentRound + 1} 爻：
                {yaoResults[currentRound].value === 6
                  ? "老阴（动爻）"
                  : yaoResults[currentRound].value === 7
                    ? "少阳"
                    : yaoResults[currentRound].value === 8
                      ? "少阴"
                      : "老阳（动爻）"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 爻线构建阶段 */}
      {stage === LiuYaoStage.YAO_BUILDING && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-amber-400">本卦生成</h3>
          <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
            {yaoResults.map((yao, index) => (
              <div
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <p className="text-sm text-midnight-400 mb-1">
                  第 {index + 1} 爻（从下到上）
                </p>
                {renderYao(yao, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 变卦转换阶段 */}
      {stage === LiuYaoStage.TRANSFORMATION && (
        <div className="space-y-8">
          <h3 className="text-xl font-semibold text-red-400">动爻变卦</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 本卦 */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-amber-400 mb-2">
                  {benGuaName}
                </h3>
                <h4 className="text-lg font-medium text-amber-300">本卦</h4>
              </div>
              <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
                {yaoResults.map((yao, index) => (
                  <div key={index}>{renderYao(yao, index)}</div>
                ))}
              </div>
            </div>

            {/* 变卦 */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-400 mb-2">
                  {bianGuaName}
                </h3>
                <h4 className="text-lg font-medium text-red-300">变卦</h4>
              </div>
              <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
                {bianGuaLines.map((yao, index) => (
                  <div key={`bian-${index}`}>{renderYao(yao, index)}</div>
                ))}
              </div>
            </div>
          </div>

          {/* 动爻说明 */}
          {yaoResults.some((yao) => yao.isChanging) && (
            <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <p className="text-red-300">
                动爻：第 {yaoResults.findIndex((yao) => yao.isChanging) + 1} 爻
              </p>
              <p className="text-sm text-midnight-400 mt-1">
                变爻预示着事物发展中的关键转折点
              </p>
            </div>
          )}
        </div>
      )}

      {/* 完成阶段 */}
      {stage === LiuYaoStage.COMPLETED && (
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center animate-pulse-glow">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-xl text-amber-400 font-medium">六爻占卜已完成</p>
          <p className="text-midnight-300">正在为您解读卦象含义...</p>
        </div>
      )}
    </div>
  );
};

export default LiuYaoAnimation;
