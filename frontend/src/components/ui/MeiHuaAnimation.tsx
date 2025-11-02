import React, { useState, useEffect, useCallback } from "react";
import type { AnimationComponentProps } from "./DivinationAnimation";
import type { DivinationResult } from "../../types/divination";

// 梅花易数动画阶段
enum MeiHuaStage {
  TIME_DISPLAY = "time_display", // 时间显示
  TIME_CONVERSION = "time_conversion", // 时间转数字
  CALCULATION = "calculation", // 计算过程
  HEXAGRAM_BUILDING = "hexagram_building", // 卦象构建
  TRANSFORMATION = "transformation", // 变卦
  COMPLETED = "completed", // 完成
}

// 时间信息接口
interface TimeInfo {
  year: string;
  month: string;
  day: string;
  hour: string;
}

// 计算结果接口
interface CalculationResult {
  upperTrigram: { index: number; name: string; symbol: string };
  lowerTrigram: { index: number; name: string; symbol: string };
  changingLine: number;
}

// 八卦数据
const BAGUA_DATA = [
  { name: "乾", symbol: "☰", pattern: [1, 1, 1] },
  { name: "坤", symbol: "☷", pattern: [0, 0, 0] },
  { name: "震", symbol: "☳", pattern: [0, 0, 1] },
  { name: "艮", symbol: "☶", pattern: [1, 0, 0] },
  { name: "离", symbol: "☲", pattern: [1, 0, 1] },
  { name: "坎", symbol: "☵", pattern: [0, 1, 0] },
  { name: "兑", symbol: "☱", pattern: [0, 1, 1] },
  { name: "巽", symbol: "☴", pattern: [1, 1, 0] },
];

export const MeiHuaAnimation: React.FC<AnimationComponentProps> = ({
  onComplete,
  question,
  category,
  realDivinationData, // ✨ 接收真实数据
}) => {
  const [stage, setStage] = useState<MeiHuaStage>(MeiHuaStage.TIME_DISPLAY);
  const [timeInfo, setTimeInfo] = useState<TimeInfo>({
    year: "",
    month: "",
    day: "",
    hour: "",
  });
  const [convertedNumbers, setConvertedNumbers] = useState<{
    [key: string]: number;
  }>({});
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // 获取当前时间信息
  const getCurrentTimeInfo = useCallback((): TimeInfo => {
    const now = new Date();
    const hour = now.getHours();

    // 简化的时间信息
    return {
      year: "壬寅",
      month: "八月",
      day: "初十",
      hour:
        hour >= 23 || hour < 1
          ? "子时"
          : hour >= 1 && hour < 3
            ? "丑时"
            : hour >= 3 && hour < 5
              ? "寅时"
              : hour >= 5 && hour < 7
                ? "卯时"
                : hour >= 7 && hour < 9
                  ? "辰时"
                  : hour >= 9 && hour < 11
                    ? "巳时"
                    : hour >= 11 && hour < 13
                      ? "午时"
                      : hour >= 13 && hour < 15
                        ? "未时"
                        : hour >= 15 && hour < 17
                          ? "申时"
                          : hour >= 17 && hour < 19
                            ? "酉时"
                            : hour >= 19 && hour < 21
                              ? "戌时"
                              : "亥时",
    };
  }, []);

  // 将时间文字转换为数字
  const convertTimeToNumbers = useCallback(
    (_timeInfo: TimeInfo): { [key: string]: number } => {
      return {
        year: 3, // 壬寅年的寅
        month: 8, // 八月
        day: 10, // 初十
        hour: 7, // 午时
      };
    },
    [],
  );

  // 执行计算
  const performCalculation = useCallback((): CalculationResult => {
    const numbers = convertedNumbers;

    // 上卦计算：(年 + 月 + 日) ÷ 8
    const upperSum = numbers.year + numbers.month + numbers.day;
    const upperIndex = (upperSum - 1) % 8; // 余数-1，因为数组从0开始

    // 下卦计算：(年 + 月 + 日 + 时) ÷ 8
    const lowerSum = numbers.year + numbers.month + numbers.day + numbers.hour;
    const lowerIndex = (lowerSum - 1) % 8;

    // 动爻计算：(年 + 月 + 日 + 时) ÷ 6
    const changingLine = ((lowerSum - 1) % 6) + 1; // 1-6

    return {
      upperTrigram: {
        index: upperIndex,
        name: BAGUA_DATA[upperIndex].name,
        symbol: BAGUA_DATA[upperIndex].symbol,
      },
      lowerTrigram: {
        index: lowerIndex,
        name: BAGUA_DATA[lowerIndex].name,
        symbol: BAGUA_DATA[lowerIndex].symbol,
      },
      changingLine,
    };
  }, [convertedNumbers]);

  // ✨ 新增：初始化时如果有真实数据，准备使用
  useEffect(() => {
    if (realDivinationData?.benGuaInfo) {
      console.log("✅ [MeiHuaAnimation] 接收到真实占卜数据，准备演示");
      // 不直接跳转，让动画正常流程进行，但会使用真实数据
    }
  }, [realDivinationData]);

  // 初始化时间信息
  useEffect(() => {
    if (stage === MeiHuaStage.TIME_DISPLAY) {
      const time = getCurrentTimeInfo();
      setTimeInfo(time);

      // 2秒后进入转换阶段
      const timer = setTimeout(() => {
        setStage(MeiHuaStage.TIME_CONVERSION);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, getCurrentTimeInfo]);

  // 时间转数字
  useEffect(() => {
    if (stage === MeiHuaStage.TIME_CONVERSION && !isAnimating) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        const numbers = convertTimeToNumbers(timeInfo);
        setConvertedNumbers(numbers);
        setIsAnimating(false);
        setStage(MeiHuaStage.CALCULATION);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, timeInfo, isAnimating, convertTimeToNumbers]);

  // 执行计算
  useEffect(() => {
    if (stage === MeiHuaStage.CALCULATION && !isAnimating) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        const result = performCalculation();
        setCalculationResult(result);
        setIsAnimating(false);
        setStage(MeiHuaStage.HEXAGRAM_BUILDING);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [stage, isAnimating, performCalculation]);

  // 卦象构建和变卦
  useEffect(() => {
    if (stage === MeiHuaStage.HEXAGRAM_BUILDING) {
      const timer = setTimeout(() => {
        setStage(MeiHuaStage.TRANSFORMATION);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // 完成动画
  useEffect(() => {
    if (stage === MeiHuaStage.TRANSFORMATION) {
      const timer = setTimeout(() => {
        setStage(MeiHuaStage.COMPLETED);

        // ✨ 改进：如果有真实数据，直接使用；否则使用计算结果
        if (realDivinationData?.benGuaInfo) {
          console.log("✅ [MeiHuaAnimation] 使用真实占卜数据返回结果");

          const result: DivinationResult = {
            method: "meihua",
            originalHexagram: Array.isArray(realDivinationData.benGuaInfo?.originalHexagram || realDivinationData.originalHexagram)
              ? (realDivinationData.benGuaInfo?.originalHexagram || realDivinationData.originalHexagram).join('')
              : (realDivinationData.benGuaInfo?.originalHexagram || realDivinationData.originalHexagram || ''),
            transformedHexagram: Array.isArray(realDivinationData.benGuaInfo?.transformedHexagram || realDivinationData.transformedHexagram)
              ? (realDivinationData.benGuaInfo?.transformedHexagram || realDivinationData.transformedHexagram).join('')
              : (realDivinationData.benGuaInfo?.transformedHexagram || realDivinationData.transformedHexagram),
            benGuaInfo: realDivinationData.benGuaInfo,
            bianGuaInfo: realDivinationData.bianGuaInfo,
            changingLineIndexes: realDivinationData.benGuaInfo?.changingLineIndexes,
            question,
            category,
            isRealResult: true,
            timestamp: new Date().toISOString(),
          };

          setTimeout(() => onComplete(result), 1000);
        } else {
          // 使用计算结果（非真实数据）
          const upperPattern =
            BAGUA_DATA[calculationResult!.upperTrigram.index].pattern;
          const lowerPattern =
            BAGUA_DATA[calculationResult!.lowerTrigram.index].pattern;

          // 转换为6-9的数值
          const patternToNumber = (pattern: number[]): number => {
            const binary = pattern.join("");
            if (binary === "000") return 6; // 老阴
            if (binary === "001") return 7; // 少阳
            if (binary === "110") return 8; // 少阴
            if (binary === "111") return 9; // 老阳
            return 7; // 默认少阳
          };

          const originalHexagram = [
            patternToNumber(lowerPattern),
            patternToNumber(lowerPattern),
            patternToNumber(lowerPattern),
            patternToNumber(upperPattern),
            patternToNumber(upperPattern),
            patternToNumber(upperPattern),
          ];

          // 模拟动爻变化
          const transformedHexagram = [...originalHexagram];
          const changingLineIndex = calculationResult!.changingLine - 1;
          if (originalHexagram[changingLineIndex] % 2 === 0) {
            transformedHexagram[changingLineIndex] =
              originalHexagram[changingLineIndex] === 6 ? 9 : 7;
          }

          const result: DivinationResult = {
            method: "meihua",
            originalHexagram: originalHexagram.join(''),
            transformedHexagram: transformedHexagram.join(''),
            changingLineIndexes: [changingLineIndex],
            question,
            category,
            timestamp: new Date().toISOString(),
          };

          setTimeout(() => onComplete(result), 1000);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, calculationResult, onComplete, question, category, realDivinationData]);

  // 渲染时间文字
  const renderTimeText = (text: string, isConverting: boolean = false) => {
    return (
      <span
        className={`inline-block px-4 py-2 mx-1 text-2xl font-serif transition-all duration-1000 ${
          isConverting
            ? "animate-pulse bg-blue-500/20 rounded-lg border border-blue-400/30 text-blue-300"
            : "text-cyan-300"
        }`}
      >
        {text}
      </span>
    );
  };

  // 渲染数字
  const renderNumber = (number: number, label: string) => {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-lg text-midnight-300">{label}:</span>
        <div
          className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${
            isAnimating ? "animate-pulse" : ""
          }`}
        >
          {number}
        </div>
      </div>
    );
  };

  // 渲染卦象符号
  const renderTrigramSymbol = (trigram: any, isHighlight: boolean = false) => {
    return (
      <div
        className={`text-center space-y-2 transition-all duration-1000 ${
          isHighlight ? "scale-125 animate-pulse-glow" : ""
        }`}
      >
        <div
          className={`text-6xl ${isHighlight ? "text-yellow-400" : "text-cyan-300"}`}
        >
          {trigram.symbol}
        </div>
        <p
          className={`text-lg font-medium ${isHighlight ? "text-yellow-400" : "text-cyan-300"}`}
        >
          {trigram.name}卦
        </p>
      </div>
    );
  };

  return (
    <div className="text-center space-y-8">
      {/* 标题 */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          梅花易数
        </h2>
        <p className="text-midnight-300">心念一动，万物皆数</p>
      </div>

      {/* 时间显示阶段 */}
      {stage === MeiHuaStage.TIME_DISPLAY && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-cyan-400">当前时刻</h3>
          <div className="flex justify-center items-center space-x-4">
            {renderTimeText(timeInfo.year)}
            {renderTimeText(timeInfo.month)}
            {renderTimeText(timeInfo.day)}
            {renderTimeText(timeInfo.hour)}
          </div>
        </div>
      )}

      {/* 时间转换阶段 */}
      {stage === MeiHuaStage.TIME_CONVERSION && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-blue-400">时间化数</h3>
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-4">
              {Object.entries(timeInfo).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className={`transition-all duration-1000 ${
                      convertedNumbers[key] ? "opacity-50" : ""
                    }`}
                  >
                    {renderTimeText(value, true)}
                  </div>
                  {convertedNumbers[key] && (
                    <div className="mt-2 animate-fadeIn">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {convertedNumbers[key]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 计算阶段 */}
      {stage === MeiHuaStage.CALCULATION && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-blue-400">易数推演</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 上卦计算 */}
            <div className="space-y-4">
              <h4 className="text-lg text-cyan-300">上卦计算</h4>
              <div className="space-y-2">
                <div className="flex justify-center space-x-4">
                  {renderNumber(convertedNumbers.year, "年")}
                  <span className="text-2xl text-midnight-300">+</span>
                  {renderNumber(convertedNumbers.month, "月")}
                  <span className="text-2xl text-midnight-300">+</span>
                  {renderNumber(convertedNumbers.day, "日")}
                </div>
                <div className="text-center">
                  <span className="text-lg text-midnight-300">
                    ={" "}
                    {convertedNumbers.year +
                      convertedNumbers.month +
                      convertedNumbers.day}
                  </span>
                  <span className="text-lg text-midnight-300 mx-2">÷ 8</span>
                  <span className="text-lg text-midnight-300">
                    余{" "}
                    {((convertedNumbers.year +
                      convertedNumbers.month +
                      convertedNumbers.day -
                      1) %
                      8) +
                      1}
                  </span>
                </div>
              </div>
            </div>

            {/* 下卦计算 */}
            <div className="space-y-4">
              <h4 className="text-lg text-cyan-300">下卦计算</h4>
              <div className="space-y-2">
                <div className="flex justify-center space-x-4">
                  {renderNumber(convertedNumbers.year, "年")}
                  <span className="text-2xl text-midnight-300">+</span>
                  {renderNumber(convertedNumbers.month, "月")}
                  <span className="text-2xl text-midnight-300">+</span>
                  {renderNumber(convertedNumbers.day, "日")}
                  <span className="text-2xl text-midnight-300">+</span>
                  {renderNumber(convertedNumbers.hour, "时")}
                </div>
                <div className="text-center">
                  <span className="text-lg text-midnight-300">
                    ={" "}
                    {convertedNumbers.year +
                      convertedNumbers.month +
                      convertedNumbers.day +
                      convertedNumbers.hour}
                  </span>
                  <span className="text-lg text-midnight-300 mx-2">÷ 8</span>
                  <span className="text-lg text-midnight-300">
                    余{" "}
                    {((convertedNumbers.year +
                      convertedNumbers.month +
                      convertedNumbers.day +
                      convertedNumbers.hour -
                      1) %
                      8) +
                      1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 卦象构建阶段 */}
      {stage === MeiHuaStage.HEXAGRAM_BUILDING && calculationResult && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-cyan-400">卦象合成</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* 上卦 */}
            <div className="space-y-4">
              <h4 className="text-lg text-cyan-300">上卦</h4>
              {renderTrigramSymbol(calculationResult.upperTrigram)}
            </div>

            {/* 合成符号 */}
            <div className="text-4xl text-midnight-300 animate-pulse">+</div>

            {/* 下卦 */}
            <div className="space-y-4">
              <h4 className="text-lg text-cyan-300">下卦</h4>
              {renderTrigramSymbol(calculationResult.lowerTrigram)}
            </div>
          </div>

          <div className="mt-8 p-6 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
            <h4 className="text-lg font-medium text-cyan-300 mb-4">本卦</h4>
            <div className="flex justify-center items-center space-x-8">
              {renderTrigramSymbol(calculationResult.upperTrigram)}
              <div className="text-2xl text-midnight-300">⟶</div>
              {renderTrigramSymbol(calculationResult.lowerTrigram)}
            </div>
            <p className="text-lg text-midnight-200 mt-4">
              {calculationResult.upperTrigram.name}上
              {calculationResult.lowerTrigram.name}下
            </p>
          </div>
        </div>
      )}

      {/* 变卦阶段 */}
      {stage === MeiHuaStage.TRANSFORMATION && calculationResult && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-yellow-400">动爻定位</h3>

          <div className="text-center space-y-4">
            <div className="inline-block px-6 py-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <p className="text-lg text-yellow-400">
                动爻：第 {calculationResult.changingLine} 爻
              </p>
              <p className="text-sm text-midnight-300 mt-1">
                变爻揭示事物发展的关键
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 本卦 */}
            <div className="space-y-4">
              <h4 className="text-lg text-cyan-300">本卦</h4>
              <div className="flex justify-center items-center space-x-4">
                {renderTrigramSymbol(calculationResult.upperTrigram)}
                <div className="text-2xl text-midnight-300">⟶</div>
                {renderTrigramSymbol(calculationResult.lowerTrigram)}
              </div>
            </div>

            {/* 变卦指示 */}
            <div className="space-y-4">
              <h4 className="text-lg text-yellow-400">变卦趋势</h4>
              <div className="flex justify-center items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse-glow">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 完成阶段 */}
      {stage === MeiHuaStage.COMPLETED && (
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse-glow">
            <span className="text-3xl">🔮</span>
          </div>
          <p className="text-xl text-cyan-400 font-medium">梅花易数已完成</p>
          <p className="text-midnight-300">正在为您解读卦象含义...</p>
        </div>
      )}
    </div>
  );
};

export default MeiHuaAnimation;
