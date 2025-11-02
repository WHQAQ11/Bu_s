import React from "react";

// 定义组件清晰的Props接口
interface YaoSymbolProps {
  type: "yang" | "yin";
  color: "amber" | "red";
  isChanging: boolean;
  size?: "sm" | "md" | "lg";
  intensity?: number;
}

// 传统阴爻断口比例常量
const YIN_PROPORTIONS = {
  leftSegment: 0.375, // 3/8
  break: 0.25, // 2/8
  rightSegment: 0.375, // 3/8
};

// SVG尺寸常量 - 增加线条粗细
const SVG_DIMENSIONS = {
  width: 192,
  height: 18, // 从12增加到18，增加50%的粗细
};

// 计算阴爻断口位置
const calculateYinSegments = () => {
  const { width } = SVG_DIMENSIONS;
  const { leftSegment } = YIN_PROPORTIONS;

  const segmentWidth = width * leftSegment;
  const breakStart = segmentWidth;
  const breakEnd = width - segmentWidth;

  return {
    leftEnd: breakStart,
    rightStart: breakEnd,
  };
};

const YaoSymbol: React.FC<YaoSymbolProps> = ({
  type,
  color,
  isChanging,
  size: _size = "md", // 标记为未使用但保留接口
  intensity = 1,
}) => {
  const { leftEnd, rightStart } = calculateYinSegments();
  const { width, height } = SVG_DIMENSIONS;

  // 动画强度调整
  const animationIntensity = isChanging ? intensity : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`
        w-full h-full overflow-visible
        ${isChanging ? "animate-glow-pulse" : ""}
        transition-all duration-1000
      `}
      style={{
        filter:
          animationIntensity > 0
            ? `
            drop-shadow(0 0 ${12 * animationIntensity}px rgba(251, 191, 36, ${0.9 * animationIntensity}))
            drop-shadow(0 0 ${24 * animationIntensity}px rgba(217, 119, 6, ${0.7 * animationIntensity}))
            drop-shadow(0 0 ${36 * animationIntensity}px rgba(180, 83, 9, ${0.5 * animationIntensity}))
            drop-shadow(0 0 ${48 * animationIntensity}px rgba(139, 69, 19, ${0.3 * animationIntensity}))
          `
            : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))",
      }}
    >
      <defs>
        {/* 琥珀色渐变 - 增强玉器质感 */}
        <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="20%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="80%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* 红色渐变 - 增强玛瑙质感 */}
        <linearGradient id="red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEE2E2" />
          <stop offset="20%" stopColor="#FECACA" />
          <stop offset="40%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="80%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* 玉器纹理效果 */}
        <filter id="jade-texture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="5"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0.1"
            result="desaturatedNoise"
          />
          <feComponentTransfer in="desaturatedNoise" result="texture">
            <feFuncA
              type="discrete"
              tableValues="0 0.1 0.1 0.2 0.2 0.1 0.1 0"
            />
          </feComponentTransfer>
        </filter>

        {/* 立体内嵌效果 */}
        <filter id="inset-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
          <feFlood flood-color="#000000" flood-opacity="0.3" result="color" />
          <feComposite
            in="color"
            in2="offsetBlur"
            operator="in"
            result="shadow"
          />
          <feComposite
            in="shadow"
            in2="SourceAlpha"
            operator="in"
            result="innerShadow"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="innerShadow" />
          </feMerge>
        </filter>

        {/* 光泽和反射效果 */}
        <filter
          id="polish-reflection"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
          <feSpecularLighting
            result="specOut"
            in="blur"
            specularConstant="1.5"
            specularExponent="20"
            lighting-color="white"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feSpecularLighting>
          <feComposite
            in="specOut"
            in2="SourceAlpha"
            operator="in"
            result="specOut2"
          />
          <feComposite
            in="SourceGraphic"
            in2="specOut2"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
          />
        </filter>

        {/* 发光效果基础 */}
        <filter id="base-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 动爻多层发光效果 */}
        <filter
          id="changing-glow-layer1"
          x="-200%"
          y="-200%"
          width="500%"
          height="500%"
        >
          <feGaussianBlur stdDeviation="8" result="blur1" />
          <feColorMatrix
            in="blur1"
            type="matrix"
            values="1 0 0 0 1  0 1 0 0 0.8  0 0 1 0 0  0 0 0 1.5 0"
            result="color1"
          />
        </filter>

        <filter
          id="changing-glow-layer2"
          x="-300%"
          y="-300%"
          width="700%"
          height="700%"
        >
          <feGaussianBlur stdDeviation="16" result="blur2" />
          <feColorMatrix
            in="blur2"
            type="matrix"
            values="1 0 0 0 0.9  0 1 0 0 0.4  0 0 1 0 0  0 0 0 1.2 0"
            result="color2"
          />
        </filter>

        <filter
          id="changing-glow-layer3"
          x="-400%"
          y="-400%"
          width="900%"
          height="900%"
        >
          <feGaussianBlur stdDeviation="24" result="blur3" />
          <feColorMatrix
            in="blur3"
            type="matrix"
            values="1 0 0 0 0.8  0 1 0 0 0.2  0 0 1 0 0  0 0 0 1 0"
            result="color3"
          />
        </filter>

        {/* 动爻能量流动效果 */}
        <radialGradient id="energy-flow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0">
            <animate
              attributeName="stop-opacity"
              values="0;0.8;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.5">
            <animate
              attributeName="stop-opacity"
              values="0.5;1;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#D97706" stopOpacity="0">
            <animate
              attributeName="stop-opacity"
              values="0;0.3;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </radialGradient>

        {/* 动爻脉冲光环 */}
        <circle id="pulse-ring" r="20" fill="none" strokeWidth="2" opacity="0">
          <animate
            attributeName="r"
            values="20;40;20"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-width"
            values="2;1;2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </defs>

      {/* 阳爻：完整的实线 - 增强立体感 */}
      {type === "yang" && (
        <g>
          {/* 主线条 - 玉器质感 */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#inset-shadow)"
            opacity="0.95"
          />

          {/* 纹理层 */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#jade-texture)"
            opacity="0.3"
          />

          {/* 光泽层 */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#polish-reflection)"
            opacity="0.6"
          />

          {/* 高光效果 */}
          <line
            x1="4"
            y1={height / 2 - 4}
            x2={width - 4}
            y2={height / 2 - 4}
            stroke={
              color === "amber"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(255, 255, 255, 0.3)"
            }
            strokeWidth={3}
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* 边缘强化 */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="none"
            strokeWidth={height + 2}
            strokeLinecap="round"
            filter="url(#base-glow)"
            opacity={isChanging ? 0.8 : 0.3}
          />

          {/* 动爻特殊效果 */}
          {isChanging && (
            <>
              {/* 动爻能量背景 */}
              <rect
                x="0"
                y="0"
                width={width}
                height={height}
                fill="url(#energy-flow)"
                opacity="0.6"
              />

              {/* 多层发光效果 */}
              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="none"
                strokeWidth={height}
                strokeLinecap="round"
                filter="url(#changing-glow-layer1)"
                opacity="0.8"
              />

              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="none"
                strokeWidth={height + 4}
                strokeLinecap="round"
                filter="url(#changing-glow-layer2)"
                opacity="0.6"
              />

              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="none"
                strokeWidth={height + 8}
                strokeLinecap="round"
                filter="url(#changing-glow-layer3)"
                opacity="0.4"
              />

              {/* 动爻脉冲光环 */}
              <use
                href="#pulse-ring"
                x={width / 2}
                y={height / 2}
                stroke={color === "amber" ? "#FDE68A" : "#FEE2E2"}
              />
            </>
          )}
        </g>
      )}

      {/* 阴爻：两条断线 - 增强立体感和毛边 */}
      {type === "yin" && (
        <g>
          {/* 左段 - 主线条 */}
          <line
            x1="0"
            y1={height / 2}
            x2={leftEnd}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#inset-shadow)"
            opacity="0.95"
          />

          {/* 左段 - 纹理层 */}
          <line
            x1="0"
            y1={height / 2}
            x2={leftEnd}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#jade-texture)"
            opacity="0.3"
          />

          {/* 左段 - 光泽层 */}
          <line
            x1="0"
            y1={height / 2}
            x2={leftEnd}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#polish-reflection)"
            opacity="0.6"
          />

          {/* 右段 - 主线条 */}
          <line
            x1={rightStart}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#inset-shadow)"
            opacity="0.95"
          />

          {/* 右段 - 纹理层 */}
          <line
            x1={rightStart}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#jade-texture)"
            opacity="0.3"
          />

          {/* 右段 - 光泽层 */}
          <line
            x1={rightStart}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={`url(#${color}-gradient)`}
            strokeWidth={height}
            strokeLinecap="round"
            filter="url(#polish-reflection)"
            opacity="0.6"
          />

          {/* 左段高光 */}
          <line
            x1="4"
            y1={height / 2 - 4}
            x2={leftEnd - 4}
            y2={height / 2 - 4}
            stroke={
              color === "amber"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(255, 255, 255, 0.3)"
            }
            strokeWidth={3}
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* 右段高光 */}
          <line
            x1={rightStart + 4}
            y1={height / 2 - 4}
            x2={width - 4}
            y2={height / 2 - 4}
            stroke={
              color === "amber"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(255, 255, 255, 0.3)"
            }
            strokeWidth={3}
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* 边缘强化 - 左段 */}
          <line
            x1="0"
            y1={height / 2}
            x2={leftEnd}
            y2={height / 2}
            stroke="none"
            strokeWidth={height + 2}
            strokeLinecap="round"
            filter="url(#base-glow)"
            opacity={isChanging ? 0.8 : 0.3}
          />

          {/* 边缘强化 - 右段 */}
          <line
            x1={rightStart}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="none"
            strokeWidth={height + 2}
            strokeLinecap="round"
            filter="url(#base-glow)"
            opacity={isChanging ? 0.8 : 0.3}
          />

          {/* 毛边断裂效果 - 左断口 */}
          <ellipse
            cx={leftEnd}
            cy={height / 2}
            rx="2"
            ry={height / 2}
            fill="rgba(0, 0, 0, 0.2)"
            opacity="0.6"
          />

          {/* 毛边断裂效果 - 右断口 */}
          <ellipse
            cx={rightStart}
            cy={height / 2}
            rx="2"
            ry={height / 2}
            fill="rgba(0, 0, 0, 0.2)"
            opacity="0.6"
          />

          {/* 动爻特殊效果 */}
          {isChanging && (
            <>
              {/* 动爻能量背景 */}
              <rect
                x="0"
                y="0"
                width={width}
                height={height}
                fill="url(#energy-flow)"
                opacity="0.6"
              />

              {/* 多层发光效果 - 左段 */}
              <line
                x1="0"
                y1={height / 2}
                x2={leftEnd}
                y2={height / 2}
                stroke="none"
                strokeWidth={height}
                strokeLinecap="round"
                filter="url(#changing-glow-layer1)"
                opacity="0.8"
              />

              <line
                x1="0"
                y1={height / 2}
                x2={leftEnd}
                y2={height / 2}
                stroke="none"
                strokeWidth={height + 4}
                strokeLinecap="round"
                filter="url(#changing-glow-layer2)"
                opacity="0.6"
              />

              <line
                x1="0"
                y1={height / 2}
                x2={leftEnd}
                y2={height / 2}
                stroke="none"
                strokeWidth={height + 8}
                strokeLinecap="round"
                filter="url(#changing-glow-layer3)"
                opacity="0.4"
              />

              {/* 多层发光效果 - 右段 */}
              <line
                x1={rightStart}
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="none"
                strokeWidth={height}
                strokeLinecap="round"
                filter="url(#changing-glow-layer1)"
                opacity="0.8"
              />

              <line
                x1={rightStart}
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="none"
                strokeWidth={height + 4}
                strokeLinecap="round"
                filter="url(#changing-glow-layer2)"
                opacity="0.6"
              />

              <line
                x1={rightStart}
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="none"
                strokeWidth={height + 8}
                strokeLinecap="round"
                filter="url(#changing-glow-layer3)"
                opacity="0.4"
              />

              {/* 动爻脉冲光环 - 左段 */}
              <use
                href="#pulse-ring"
                x={leftEnd / 2}
                y={height / 2}
                stroke={color === "amber" ? "#FDE68A" : "#FEE2E2"}
              />

              {/* 动爻脉冲光环 - 右段 */}
              <use
                href="#pulse-ring"
                x={(rightStart + width) / 2}
                y={height / 2}
                stroke={color === "amber" ? "#FDE68A" : "#FEE2E2"}
              />
            </>
          )}
        </g>
      )}
    </svg>
  );
};

export default YaoSymbol;
