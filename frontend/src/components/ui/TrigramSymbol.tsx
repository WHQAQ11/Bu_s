import React from "react";

interface TrigramSymbolProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

// 太极图组件
export const TaiJi: React.FC<TrigramSymbolProps> = ({
  size = "md",
  className = "",
  animate = true,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} ${animate ? "animate-spin-slow" : ""}`}
      title="太极"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 外圆边框 - 使用纯黑色 */}
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke="#000000"
          strokeWidth="1"
        />

        {/* 整圆背景 - 白色 */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" />

        {/* 左半边黑色 */}
        <path
          d="M 50 2 A 48 48 0 0 0 50 98 A 24 24 0 0 0 50 50 A 24 24 0 0 1 50 2"
          fill="#000000"
        />

        {/* 右半边白色 */}
        <path
          d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 2"
          fill="#FFFFFF"
        />

        {/* 上方白色小圆 */}
        <circle cx="50" cy="26" r="8" fill="#FFFFFF" />

        {/* 下方黑色小圆 */}
        <circle cx="50" cy="74" r="8" fill="#000000" />
      </svg>
    </div>
  );
};

// 八卦符号组件
export const BaGua: React.FC<{
  trigram: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ trigram, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-6 h-12",
    md: "w-8 h-16",
    lg: "w-12 h-24",
  };

  const lineWidths = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  // 八卦的二进制表示 (从下到上)
  const trigrams: { [key: string]: number[] } = {
    乾: [1, 1, 1], // ☰
    坤: [0, 0, 0], // ☷
    震: [0, 0, 1], // ☳
    艮: [1, 0, 0], // ☶
    离: [1, 0, 1], // ☲
    坎: [0, 1, 0], // ☵
    兑: [0, 1, 1], // ☱
    巽: [1, 1, 0], // ☴
  };

  const lines = trigrams[trigram] || [1, 1, 1];

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex flex-col justify-between items-center p-1`}
    >
      {lines
        .slice()
        .reverse()
        .map((line, index) => (
          <div
            key={index}
            className={`w-full ${lineWidths[size]} border border-gray-800 transition-all duration-300 ${
              line === 1 ? "bg-black" : "bg-white relative"
            }`}
          >
            {line === 0 && (
              <div className="absolute inset-0 flex justify-center">
                <div className="w-1/3 h-full bg-black"></div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

// 六爻卦象组件
export const Hexagram: React.FC<{
  lines: number[];
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ lines, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-6 h-20",
    md: "w-8 h-24",
    lg: "w-12 h-32",
  };

  const lineWidths = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex flex-col justify-between items-center p-1 bg-gray-100 rounded`}
    >
      {lines
        .slice()
        .reverse()
        .map((line, index) => (
          <div
            key={index}
            className={`w-full ${lineWidths[size]} border border-gray-800 transition-all duration-500 ${
              line === 6 || line === 9
                ? "bg-red-600 shadow-lg animate-pulse"
                : line === 7 || line === 8
                  ? "bg-black"
                  : "bg-white relative"
            }`}
          >
            {line === 8 && (
              <div className="absolute inset-0 flex justify-center">
                <div className="w-1/3 h-full bg-black"></div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

// 星星装饰组件
export const Stars: React.FC<{ count?: number; className?: string }> = ({
  count = 20,
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-golden-400 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// 完整八卦图组件
export const BaguaDiagram: React.FC<TrigramSymbolProps> = ({
  size = "md",
  className = "",
  animate = true,
}) => {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };

  const trigramSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // 后天八卦方位排列
  const baguaPositions = [
    { name: "离", position: "top", symbol: "☲", angle: 0 },
    { name: "坤", position: "top-right", symbol: "☷", angle: 45 },
    { name: "兑", position: "right", symbol: "☱", angle: 90 },
    { name: "乾", position: "bottom-right", symbol: "☰", angle: 135 },
    { name: "坎", position: "bottom", symbol: "☵", angle: 180 },
    { name: "艮", position: "bottom-left", symbol: "☶", angle: 225 },
    { name: "震", position: "left", symbol: "☳", angle: 270 },
    { name: "巽", position: "top-left", symbol: "☴", angle: 315 },
  ];

  const getTrigramPosition = (angle: number) => {
    const radius = size === "sm" ? 50 : size === "md" ? 70 : 90;
    const centerX = 50;
    const centerY = 50;
    const radian = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(radian);
    const y = centerY + radius * Math.sin(radian);
    return { x, y };
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 背景圆 - 使用纯白色 */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1"
        />

        {/* 八卦围绕太极 */}
        {baguaPositions.map((trigram) => {
          const pos = getTrigramPosition(trigram.angle);
          return (
            <g key={trigram.name} transform={`translate(${pos.x}, ${pos.y})`}>
              {/* 卦象背景 - 纯白色背景，黑色边框 */}
              <circle
                cx="0"
                cy="0"
                r="8"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1"
              />

              {/* 卦名 - 纯黑色 */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                className={`font-serif ${trigramSizes[size]}`}
                fill="#000000"
                style={{
                  fontSize:
                    size === "sm" ? "6px" : size === "md" ? "8px" : "10px",
                }}
              >
                {trigram.name}
              </text>
            </g>
          );
        })}

        {/* 中心太极图 */}
        <g transform="translate(50, 50)">
          {animate && (
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="20s"
              repeatCount="indefinite"
            />
          )}

          {/* 太极背景圆 - 纯白色 */}
          <circle cx="0" cy="0" r="20" fill="#FFFFFF" />

          {/* 左半边黑色 */}
          <path
            d="M 0 -20 A 20 20 0 0 0 0 20 A 10 10 0 0 0 0 0 A 10 10 0 0 1 0 -20"
            fill="#000000"
          />

          {/* 右半边白色 */}
          <path
            d="M 0 -20 A 20 20 0 0 1 0 20 A 10 10 0 0 1 0 0 A 10 10 0 0 0 0 -20"
            fill="#FFFFFF"
          />

          {/* 上方白色小圆 */}
          <circle cx="0" cy="-10" r="4" fill="#FFFFFF" />

          {/* 下方黑色小圆 */}
          <circle cx="0" cy="10" r="4" fill="#000000" />
        </g>

        {/* 连接线 - 使用纯黑色 */}
        {baguaPositions.map((trigram) => {
          const pos = getTrigramPosition(trigram.angle);
          return (
            <line
              key={`line-${trigram.name}`}
              x1="50"
              y1="50"
              x2={pos.x}
              y2={pos.y}
              stroke="#000000"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

// 小尺寸八卦图标组件（专用于按钮）- 只包含太极阴阳鱼部分
export const SmallBaguaIcon: React.FC<{
  className?: string;
  animate?: boolean;
}> = ({ className = "", animate = true }) => {
  return (
    <div
      className={`w-8 h-8 ${className} ${animate ? "animate-spin-slow" : ""}`}
      title="太极"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 太极背景圆 */}
        <circle cx="50" cy="50" r="48" fill="white" stroke="black" strokeWidth="1" />

        {/* S形分割 - 太极阴阳 */}
        <path
          d="M 50,2 A 48,48 0 0 1 50,98 A 24,24 0 0 0 50,50 A 24,24 0 0 1 50,2"
          fill="black"
        />

        {/* 白色鱼眼 */}
        <circle cx="50" cy="26" r="8" fill="white" />

        {/* 黑色鱼眼 */}
        <circle cx="50" cy="74" r="8" fill="black" />
      </svg>
    </div>
  );
};

// 神秘光环组件
export const MysticalAura: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 to-transparent rounded-full blur-xl animate-pulse-glow"></div>
      <div className="relative">{children}</div>
    </div>
  );
};
