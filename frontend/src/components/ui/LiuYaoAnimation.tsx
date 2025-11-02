import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimationComponentProps } from "./DivinationAnimation";
import YaoSymbol from "./YaoSymbol";
import { DivinationService } from "../../services/divination";
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
  realDivinationData, // ✨ 接收真实数据
  onComplete,
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

  // API调用状态
  const [isCallingAPI, setIsCallingAPI] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [realDivinationResult, setRealDivinationResult] = useState<any>(null);

  // 生成随机铜钱结果 - 恢复位置参数
  const generateCoinResult = useCallback((): CoinResult[] => {
    return Array.from({ length: 3 }, (_, i) => ({
      isHeads: Math.random() < 0.5,
      rotation: Math.random() * 360, // 恢复旋转参数
      x: (i - 1) * 120, // 恢复位置参数，让铜钱分开显示
      y: 0, // 垂直位置保持一致
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

  // 调用真实占卜API
  const callRealDivinationAPI = useCallback(async () => {
    setIsCallingAPI(true);
    setApiError(null);

    try {
      console.log("🔮 正在调用真实占卜API...");
      const result = await DivinationService.performRealDivination('liuyao', question);
      console.log("✅ 真实占卜API调用成功:", result);
      setRealDivinationResult(result);

      // 显示成功提示给用户
      if (result.success) {
        console.log("🎉 真实占卜数据已保存到数据库");
        // 可以在这里添加一个小的成功提示UI
      }

      return result;
    } catch (error: any) {
      console.error("❌ 真实占卜API调用失败:", error);
      setApiError(error.message || "占卜API调用失败");

      // 重要：不静默降级，让用户知道真实API调用失败了
      console.warn("⚠️ 重要提醒：真实占卜API调用失败，当前显示的是模拟数据，不会保存到历史记录中");
      console.warn("⚠️ 请检查网络连接和登录状态，或联系管理员");

      // 可以选择抛出错误而不是返回null，这样上层可以处理
      throw error;
    } finally {
      setIsCallingAPI(false);
    }
  }, [question]);

  // 生成mock降级结果
  const generateMockResult = useCallback((yaoResults: YaoInfo[]) => {
    const originalHexagram = yaoResults.map((yao) => yao.value);
    const transformedHexagram = yaoResults.map((yao) => {
      if (yao.isChanging) {
        return yao.value === 6 ? 9 : 6;
      }
      return yao.value;
    });

    const changingLineIndexes = yaoResults
      .map((yao, index) => (yao.isChanging ? index : -1))
      .filter((index) => index >= 0);

    return {
      benGuaInfo: getHexagramInfo(yaoResults),
      bianGuaInfo: getHexagramInfo(bianGuaLines),
      changingLineIndexes,
      originalHexagram,
      transformedHexagram,
      question,
      method: "liuyao" as "liuyao" | "meihua" | "ai",
      isMockResult: true,
      timestamp: new Date().toISOString()
    };
  }, [bianGuaLines]);

  // ✨ 新增：初始化时如果有真实数据，准备使用
  useEffect(() => {
    if (realDivinationData?.benGuaInfo) {
      console.log("✅ [LiuYaoAnimation] 接收到真实占卜数据，准备演示");
      // 不直接跳转，让动画正常流程进行，但会使用真实数据
    }
  }, [realDivinationData]);

  // 将后端API结果转换为前端格式
  const convertAPIResultToDisplayFormat = useCallback((apiResult: any) => {
    console.log("🔄 转换API结果为显示格式:", apiResult);

    if (!apiResult || !apiResult.result) {
      console.warn("⚠️ API结果格式不完整，使用降级处理");
      return null;
    }

    const { result } = apiResult;

    // 提取本卦爻值
    let originalHexagram: number[] = [];
    let changingLineIndexes: number[] = [];

    if (result.originalGua && result.originalGua.yaos) {
      originalHexagram = result.originalGua.yaos.map((yao: any) => yao.value);
      changingLineIndexes = result.originalGua.yaos
        .map((yao: any, index: number) => (yao.isChanging ? index : -1))
        .filter((index: number) => index >= 0);
    }

    // 提取变卦爻值（如果有）
    let transformedHexagram = originalHexagram;
    if (result.changedGua && result.changedGua.yaos) {
      transformedHexagram = result.changedGua.yaos.map((yao: any) => yao.value);
    } else {
      // 如果没有变卦，手动计算变卦
      transformedHexagram = originalHexagram.map((value, index) => {
        if (changingLineIndexes.includes(index)) {
          return value === 6 ? 9 : value === 9 ? 6 : value;
        }
        return value;
      });
    }

    // 构造类似getHexagramInfo返回的数据结构
    const benGuaInfo = {
      name: result.originalGua?.name || "未知卦",
      number: result.originalGua?.number || 1,
      symbolism: result.originalGua?.properties?.symbolism || "",
      elements: {
        wuxing: result.originalGua?.properties?.wuxing || "金",
        nature: result.originalGua?.properties?.nature || "刚健",
        season: result.originalGua?.properties?.season || "春",
        direction: result.originalGua?.properties?.direction || "东",
        relationship: result.originalGua?.properties?.relationship || "创造"
      },
      guaci: result.interpretation?.guaci || "",
      yaoci: result.interpretation?.yaoci || [],
      shiyi: result.interpretation?.shiyi || "",
      analysis: result.interpretation?.analysis || ""
    };

    const bianGuaInfo = result.changedGua ? {
      name: result.changedGua.name || "未知卦",
      number: result.changedGua.number || 1,
      symbolism: result.changedGua?.properties?.symbolism || "",
      elements: {
        wuxing: result.changedGua?.properties?.wuxing || "金",
        nature: result.changedGua?.properties?.nature || "刚健",
        season: result.changedGua?.properties?.season || "春",
        direction: result.changedGua?.properties?.direction || "东",
        relationship: result.changedGua?.properties?.relationship || "创造"
      }
    } : null;

    return {
      benGuaInfo,
      bianGuaInfo,
      changingLineIndexes,
      originalHexagram,
      transformedHexagram,
      question,
      method: "liuyao",
      isRealResult: true,
      logId: apiResult.log_id,
      aiInterpretation: apiResult.ai_interpretation,
      timestamp: apiResult.timestamp
    };
  }, [question]);

  // 执行铜钱投掷动画
  const performCoinToss = useCallback(async () => {
    setIsAnimating(true);
    console.log(`🎲 [LiuYaoAnimation] 开始第 ${currentRound + 1} 次投掷，realDivinationData:`, realDivinationData);

    // 生成新的铜钱结果
    let newCoins: CoinResult[];

    // 如果有真实数据，使用真实数据对应的爻值；否则随机生成
    const hasRealData = realDivinationData?.benGuaInfo?.originalHexagram &&
                        Array.isArray(realDivinationData.benGuaInfo.originalHexagram) &&
                        currentRound < realDivinationData.benGuaInfo.originalHexagram.length;

    if (hasRealData) {
      const realYaoValue = realDivinationData.benGuaInfo!.originalHexagram![currentRound];
      console.log(`📍 [LiuYaoAnimation] 第 ${currentRound + 1} 爻使用真实数据: ${realYaoValue}`);

      // 根据真实爻值反推铜钱结果
      // 6(老阴)=2背1正, 7(少阳)=1背2正, 8(少阴)=2正1背, 9(老阳)=3背
      const coinsConfig = {
        6: [1, 1, 0], // 老阴：两背一正
        7: [1, 0, 0], // 少阳：一背两正
        8: [0, 0, 1], // 少阴：两正一背
        9: [1, 1, 1], // 老阳：三背
      };

      const backPattern = coinsConfig[realYaoValue as keyof typeof coinsConfig] || [0, 0, 0];
      newCoins = Array.from({ length: 3 }, (_, i) => ({
        isHeads: backPattern[i] === 1, // 1为背（文字面）
        rotation: Math.random() * 360,
        x: (i - 1) * 120,
        y: 0,
      }));
    } else {
      // 没有真实数据时随机生成
      console.log(`🎲 [LiuYaoAnimation] 第 ${currentRound + 1} 爻使用随机数据`);
      newCoins = generateCoinResult();
    }

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
      console.log("✅ [LiuYaoAnimation] 6次投掷完成，进入YAO_BUILDING阶段");
      setStage(LiuYaoStage.YAO_BUILDING);
      setTimeout(() => {
        console.log("✅ [LiuYaoAnimation] 进入TRANSFORMATION阶段");
        setStage(LiuYaoStage.TRANSFORMATION);
      }, 2000);
    }
  }, [currentRound, generateCoinResult, calculateYaoValue, yaoResults, realDivinationData]);

  // 自动开始投掷
  useEffect(() => {
    console.log("🎬 [占卜流程] 阶段变化:", { stage, currentRound, isAnimating });

    if (stage === LiuYaoStage.COIN_TOSS && !isAnimating) {
      console.log("🎲 [占卜流程] 准备开始投掷铜钱...");
      const timer = setTimeout(() => {
        performCoinToss();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage, currentRound, isAnimating, performCoinToss]);

  // 处理变卦完成
  useEffect(() => {
    if (stage === LiuYaoStage.TRANSFORMATION) {
      console.log("🔄 [占卜流程] 进入变卦阶段，爻线数量:", yaoResults.length);

      // 计算本卦和变卦的卦名
      if (yaoResults.length === 6) {
        console.log("⚡ [占卜流程] 开始计算本卦和变卦...");
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

      const timer = setTimeout(async () => {
        console.log("🎯 [占卜流程] 变卦转换完成");
        setStage(LiuYaoStage.COMPLETED);

        // ✨ 改进：直接使用接收到的真实数据，不需要再调用API
        setTimeout(() => {
          console.log("✅ [LiuYaoAnimation] 使用真实占卜数据返回结果");

          const result = {
            method: "liuyao" as "liuyao" | "meihua" | "ai",
            question,
            category,
            originalHexagram: realDivinationData?.benGuaInfo?.originalHexagram || realDivinationData?.originalHexagram || yaoResults.map(yao => yao.value),
            transformedHexagram: realDivinationData?.benGuaInfo?.transformedHexagram || realDivinationData?.transformedHexagram,
            benGuaInfo: realDivinationData?.benGuaInfo,
            bianGuaInfo: realDivinationData?.bianGuaInfo,
            changingLineIndexes: realDivinationData?.benGuaInfo?.changingLineIndexes || yaoResults
              .map((yao, index) => (yao.isChanging ? index : -1))
              .filter((index) => index >= 0),
            isRealResult: true, // ✅ 始终标记为真实结果
            timestamp: new Date().toISOString(),
          };

          console.log("🚀 [LiuYaoAnimation] 返回结果:", result);
          onComplete(result);
        }, 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, yaoResults, navigate, question, category, callRealDivinationAPI, generateMockResult, convertAPIResultToDisplayFormat]);

  // 渲染铜钱组件 - 参考HTML代码结构
  const renderCoin = (coin: CoinResult, index: number) => {
    const animationDelay = index * 0.2;
    const animationDuration = 2.5 + Math.random() * 0.5;

    return (
      <div
        key={index}
        className="coin"
        style={{
          position: "absolute",
          width: "80px",
          height: "80px",
          transform: `translate(${coin.x}px, ${coin.y}px)`,
        }}
      >
        <div
          className="flipper"
          style={{
            animation: isAnimating
              ? `coinFlip ${animationDuration}s ease-in-out ${animationDelay}s forwards`
              : "none",
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* 铜钱正面 - 根据isHeads决定显示哪一面 */}
          <div
            className={`coin-face ${coin.isHeads ? "coin-front" : "coin-back"}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at center, #d4af37 0%, #b8860b 40%, #8b4513 100%)",
              boxShadow:
                "inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.5)",
              border: "3px solid #8B6914",
            }}
          >
            {/* 方孔 */}
            <div
              style={{
                position: "absolute",
                width: "30%",
                height: "30%",
                background: "#1a1a2e",
                border: "2px solid #5a3d0c",
                boxShadow: "0 0 5px rgba(0,0,0,0.7) inset",
                zIndex: 2,
              }}
            />
            {/* 招财进宝文字 - 只在正面显示 */}
            {coin.isHeads && (
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#6a4a0a",
                    fontFamily: "'KaiTi', 'STKaiti', serif",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  進
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#6a4a0a",
                    fontFamily: "'KaiTi', 'STKaiti', serif",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  寶
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6a4a0a",
                    fontFamily: "'KaiTi', 'STKaiti', serif",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  招
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6a4a0a",
                    fontFamily: "'KaiTi', 'STKaiti', serif",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  財
                </div>
              </div>
            )}
            {/* 背面纹饰 - 只在背面显示 */}
            {!coin.isHeads && (
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "80%",
                  height: "80%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "60%",
                      height: "60%",
                      border: "2px solid #6a4a0a",
                      borderRadius: "4px",
                      transform: "rotate(45deg)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 铜钱背面 - 隐藏 */}
          <div
            className="coin-face"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "50%",
              display: "none", // 隐藏，因为我们现在用单一面
            }}
          >
            {/* 方孔 */}
            <div
              style={{
                position: "absolute",
                width: "30%",
                height: "30%",
                background: "#1a1a2e",
                border: "2px solid #5a3d0c",
                boxShadow: "0 0 5px rgba(0,0,0,0.7) inset",
                zIndex: 2,
              }}
            />
            {/* 背面纹饰 - 简化版 */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: "80%",
                height: "80%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "60%",
                    height: "60%",
                    border: "2px solid #6a4a0a",
                    borderRadius: "4px",
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
            </div>
          </div>
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
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            六爻占卜
          </h2>
          <p className="text-midnight-300">三枚铜钱定乾坤，六次投揭示天机</p>
        </div>

        {/* 算法说明 */}
        <div className="flex items-center justify-center space-x-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full border border-purple-500/30 text-purple-300">
              🔮 传统算法
            </span>
            <span className="text-midnight-400">•</span>
            <span className="text-midnight-400">京氏易传</span>
            <span className="text-midnight-400">•</span>
            <span className="text-midnight-400">64卦完整数据库</span>
          </div>
        </div>
        <p className="text-xs text-midnight-500">
          {realDivinationResult ?
            "✨ 当前使用基于真实易经算法的精确计算" :
            "🎭 当前为演示模式，完成后将切换到真实算法"
          }
        </p>
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
                  {benGuaName || "计算中..."}
                </h3>
                <h4 className="text-lg font-medium text-amber-300">本卦</h4>
              </div>
              <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
                {yaoResults.length > 0 ? (
                  yaoResults.map((yao, index) => (
                    <div key={index} className="flex items-center space-x-4 w-full justify-center">
                      <div className="text-sm text-midnight-400" style={{width: '60px'}}>
                        第 {index + 1} 爻
                      </div>
                      <div className="w-48">
                        {renderYao(yao, index, false)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-midnight-400">等待爻线数据...</p>
                )}
              </div>
            </div>

            {/* 变卦 */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-400 mb-2">
                  {bianGuaName || "计算中..."}
                </h3>
                <h4 className="text-lg font-medium text-red-300">变卦</h4>
              </div>
              <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
                {bianGuaLines.length > 0 ? (
                  bianGuaLines.map((yao, index) => {
                    // 检查原本是否为动爻
                    const wasChanging = yaoResults[index]?.isChanging || false;
                    const originalValue = yaoResults[index]?.value;
                    const changedValue = yao.value;

                    return (
                      <div key={`bian-${index}`} className="flex items-center space-x-4 w-full justify-center">
                        <div className="text-sm text-midnight-400" style={{width: '60px'}}>
                          第 {index + 1} 爻
                        </div>
                        <div className="w-48">
                          {renderYao(yao, index, false)}
                        </div>
                        {wasChanging && (
                          <span className="text-yellow-400 text-xs font-bold">
                            {originalValue}→{changedValue}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-midnight-400">等待变卦计算...</p>
                )}
              </div>
            </div>
          </div>

          {/* 动爻说明 */}
          {yaoResults.some((yao) => yao.isChanging) && (
            <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <p className="text-red-300 font-semibold">
                🔥 动爻：第 {yaoResults
                  .map((yao, idx) => yao.isChanging ? idx + 1 : null)
                  .filter(i => i !== null)
                  .join('、')} 爻
              </p>
              <p className="text-sm text-midnight-400 mt-2">
                动爻在变卦中会转变：老阴(6)→老阳(9)，老阳(9)→老阴(6)
              </p>
            </div>
          )}
        </div>
      )}

      {/* 完成阶段 */}
      {stage === LiuYaoStage.COMPLETED && (
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center animate-pulse-glow">
            {isCallingAPI ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-3xl">✨</span>
            )}
          </div>

          {isCallingAPI ? (
            <>
              <p className="text-xl text-amber-400 font-medium">正在连接真实算法...</p>
              <div className="space-y-2">
                <p className="text-midnight-300">使用传统六爻算法为您精确计算</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-midnight-400">
                  <span className="px-2 py-1 bg-green-900/30 rounded-full border border-green-500/30">
                    🔮 真实算法
                  </span>
                  <span>•</span>
                  <span>六爻占卜</span>
                  <span>•</span>
                  <span>64卦完整数据库</span>
                </div>
              </div>
              {apiError && (
                <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                  <p className="text-red-300 text-sm">{apiError}</p>
                  <p className="text-midnight-400 text-xs mt-1">将使用模拟结果完成占卜</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xl text-amber-400 font-medium">
                {realDivinationResult ? "真实占卜完成" : "六爻占卜已完成"}
              </p>
              <div className="space-y-2">
                <p className="text-midnight-300">
                  {realDivinationResult
                    ? "✨ 已使用真实传统算法计算"
                    : apiError
                      ? "正在使用模拟算法完成占卜..."
                      : "正在为您解读卦象含义..."
                  }
                </p>

                {/* 算法标识 */}
                <div className="flex items-center justify-center space-x-2">
                  {realDivinationResult ? (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-green-900/30 rounded-full border border-green-500/30 text-green-300">
                        ✅ 真实算法
                      </span>
                      <span className="text-midnight-400">传统六爻 • 智能解读</span>
                    </div>
                  ) : apiError ? (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-yellow-900/30 rounded-full border border-yellow-500/30 text-yellow-300">
                        ⚠️ 模拟算法
                      </span>
                      <span className="text-midnight-400">降级模式 • 演示计算</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-blue-900/30 rounded-full border border-blue-500/30 text-blue-300">
                        🎭 模拟算法
                      </span>
                      <span className="text-midnight-400">演示模式 • 视觉效果</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiuYaoAnimation;
