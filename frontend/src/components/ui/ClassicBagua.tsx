import React, { useState, useEffect } from "react";

// --- 1. 定义数据和类型 ---

// 卦象的爻（yao）类型：1代表阳爻，0代表阴爻
type Yao = 0 | 1;
type TrigramPattern = [Yao, Yao, Yao];

interface Trigram {
  name: string;
  pattern: TrigramPattern;
}

// 后天八卦顺序（从正南/上方开始，顺时针）- 与 TrigramSymbol.tsx 保持一致
const trigramsData: Trigram[] = [
  { name: "离", pattern: [1, 0, 1] }, // 南 (上)
  { name: "坤", pattern: [0, 0, 0] }, // 西南
  { name: "兑", pattern: [0, 1, 1] }, // 西
  { name: "乾", pattern: [1, 1, 1] }, // 西北
  { name: "坎", pattern: [0, 1, 0] }, // 北 (下)
  { name: "艮", pattern: [1, 0, 0] }, // 东北
  { name: "震", pattern: [0, 0, 1] }, // 东
  { name: "巽", pattern: [1, 1, 0] }, // 东南
];

// --- 2. 经典太极图组件 ---
export const ClassicTaiJi: React.FC<{
  size?: number;
  className?: string;
  animate?: boolean;
}> = ({ size = 200, className = "", animate = true }) => {
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    if (!animate) return;

    let animationFrameId: number;
    let lastTimestamp = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animateRotation = (timestamp: number) => {
      if (timestamp - lastTimestamp >= frameInterval) {
        setRotationAngle((prevAngle) => (prevAngle + 0.5) % 360);
        lastTimestamp = timestamp;
      }
      animationFrameId = requestAnimationFrame(animateRotation);
    };

    animationFrameId = requestAnimationFrame(animateRotation);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animate]);

  const taiChiRadius = size / 2;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      <g transform={`rotate(${rotationAngle}, ${center}, ${center})`}>
        {/* 白色背景 */}
        <circle cx={center} cy={center} r={taiChiRadius} fill="white" />

        {/* 黑色部分 (S形) */}
        <path
          d={`
            M ${center}, ${center - taiChiRadius}
            A ${taiChiRadius},${taiChiRadius} 0 0 1 ${center}, ${center + taiChiRadius}
            A ${taiChiRadius / 2},${taiChiRadius / 2} 0 0 1 ${center}, ${center}
            A ${taiChiRadius / 2},${taiChiRadius / 2} 0 0 0 ${center}, ${center - taiChiRadius}
          `}
          fill="black"
        />

        {/* 白色鱼眼 */}
        <circle
          cx={center}
          cy={center - taiChiRadius / 2}
          r={taiChiRadius / 6}
          fill="white"
        />

        {/* 黑色鱼眼 */}
        <circle
          cx={center}
          cy={center + taiChiRadius / 2}
          r={taiChiRadius / 6}
          fill="black"
        />

        {/* 阴阳鱼的小圆点 */}
        {/* 白色部分中的小黑点 */}
        <circle
          cx={center}
          cy={center - taiChiRadius / 2}
          r={taiChiRadius / 20}
          fill="black"
        />

        {/* 黑色部分中的小白点 */}
        <circle
          cx={center}
          cy={center + taiChiRadius / 2}
          r={taiChiRadius / 20}
          fill="white"
        />

        {/* 外圆边框 */}
        <circle
          cx={center}
          cy={center}
          r={taiChiRadius}
          fill="none"
          stroke="black"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};

// --- 3. 卦象符号子组件 ---
interface TrigramSymbolProps {
  pattern: TrigramPattern;
}

const TrigramSymbol: React.FC<TrigramSymbolProps> = ({ pattern }) => {
  const yaoHeight = 8; // 每条爻的高度
  const yaoWidth = 60; // 阳爻的宽度
  const gap = 6; // 爻之间的间隙

  return (
    <g>
      {pattern.map((yao, index) => {
        const y = index * (yaoHeight + gap);
        if (yao === 1) {
          // 阳爻
          return (
            <rect
              key={index}
              x={-yaoWidth / 2}
              y={y}
              width={yaoWidth}
              height={yaoHeight}
              fill="black"
            />
          );
        } else {
          // 阴爻
          const brokenWidth = yaoWidth * 0.45;
          return (
            <g key={index}>
              <rect
                x={-yaoWidth / 2}
                y={y}
                width={brokenWidth}
                height={yaoHeight}
                fill="black"
              />
              <rect
                x={yaoWidth / 2 - brokenWidth}
                y={y}
                width={brokenWidth}
                height={yaoHeight}
                fill="black"
              />
            </g>
          );
        }
      })}
    </g>
  );
};

// --- 4. 完整八卦图组件 ---
export const ClassicBaguaDiagram: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}> = ({ size = "md", className = "", animate = true }) => {
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    if (!animate) return;

    let animationFrameId: number;
    let lastTimestamp = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animateRotation = (timestamp: number) => {
      if (timestamp - lastTimestamp >= frameInterval) {
        setRotationAngle((prevAngle) => (prevAngle + 0.5) % 360);
        lastTimestamp = timestamp;
      }
      animationFrameId = requestAnimationFrame(animateRotation);
    };

    animationFrameId = requestAnimationFrame(animateRotation);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animate]);

  const svgSizes = {
    sm: 300,
    md: 450,
    lg: 600,
  };

  const svgSize = svgSizes[size];
  const center = svgSize / 2;
  const taiChiRadius = svgSize * 0.16; // 80 for 500px
  const trigramRadius = svgSize * 0.32; // 160 for 500px
  const nameRadius = svgSize * 0.44; // 220 for 500px

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className={className}
    >
      {/* 背景设为透明 */}
      {/* 不设置背景，保持透明以融入页面背景 */}

      {/* A. 绘制静态的八卦和文字 */}
      <g>
        {trigramsData.map((trigram, index) => {
          const angle = index * 45; // 每个卦象间隔45度
          const radian = (angle - 90) * (Math.PI / 180); // SVG从x轴正方向开始，我们调整一下使其从顶部开始

          // 计算卦象的位置
          const trigramX = center + trigramRadius * Math.cos(radian);
          const trigramY = center + trigramRadius * Math.sin(radian);

          // 计算文字的位置
          const nameX = center + nameRadius * Math.cos(radian);
          const nameY = center + nameRadius * Math.sin(radian);

          // 调整文字大小
          const fontSizes = {
            sm: 14,
            md: 20,
            lg: 24,
          };

          const fontSize = fontSizes[size];

          return (
            <g key={trigram.name}>
              {/* 绘制卦象符号，并让它"脚朝里" */}
              <g
                transform={`translate(${trigramX}, ${trigramY}) rotate(${angle})`}
              >
                <TrigramSymbol pattern={trigram.pattern} />
              </g>
              {/* 绘制文字 */}
              <text
                x={nameX}
                y={nameY}
                fontSize={fontSize}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
              >
                {trigram.name}
              </text>
            </g>
          );
        })}
      </g>

      {/* B. 绘制旋转的太极图 */}
      <g transform={`rotate(${rotationAngle}, ${center}, ${center})`}>
        {/* 白色背景 */}
        <circle cx={center} cy={center} r={taiChiRadius} fill="white" />

        {/* 黑色部分 (S形) */}
        <path
          d={`
            M ${center}, ${center - taiChiRadius}
            A ${taiChiRadius},${taiChiRadius} 0 0 1 ${center}, ${center + taiChiRadius}
            A ${taiChiRadius / 2},${taiChiRadius / 2} 0 0 1 ${center}, ${center}
            A ${taiChiRadius / 2},${taiChiRadius / 2} 0 0 0 ${center}, ${center - taiChiRadius}
          `}
          fill="black"
        />

        {/* 白色鱼眼 */}
        <circle
          cx={center}
          cy={center - taiChiRadius / 2}
          r={taiChiRadius / 6}
          fill="white"
        />

        {/* 黑色鱼眼 */}
        <circle
          cx={center}
          cy={center + taiChiRadius / 2}
          r={taiChiRadius / 6}
          fill="black"
        />

        {/* 阴阳鱼的小圆点 */}
        {/* 白色部分中的小黑点 */}
        <circle
          cx={center}
          cy={center - taiChiRadius / 2}
          r={taiChiRadius / 20}
          fill="black"
        />

        {/* 黑色部分中的小白点 */}
        <circle
          cx={center}
          cy={center + taiChiRadius / 2}
          r={taiChiRadius / 20}
          fill="white"
        />

        {/* 外圆边框 */}
        <circle
          cx={center}
          cy={center}
          r={taiChiRadius}
          fill="none"
          stroke="black"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};
