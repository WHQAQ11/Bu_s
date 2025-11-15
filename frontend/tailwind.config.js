/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 深邃神秘的紫蓝色系
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d9fe',
          300: '#a5c4fe',
          400: '#7c9ff2',
          500: '#5b7fdb',
          600: '#4a5fb8',
          700: '#3e4a9f',
          800: '#363c7f',
          900: '#2f305f',
        },
        // 神秘金色系
        golden: {
          50: '#fffdf0',
          100: '#fefce8',
          200: '#fef9c3',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // 深邃夜空色系
        midnight: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // 卦象色彩 - 使用传统颜色
        trigram: {
          yang: '#000000', // 阳 - 黑色 (传统颜色)
          yin: '#ffffff',  // 阴 - 白色 (传统颜色)
          changing: '#dc2626', // 变爻 - 红色
        },
        // 占卜元素色系
        mystical: {
          purple: '#7c3aed',   // 神秘紫
          indigo: '#4f46e5',   // 靛蓝
          teal: '#14b8a6',     // 青绿
          rose: '#f43f5e',     // 玫瑰红
        }
      },
      fontFamily: {
        sans: ['"Microsoft YaHei"', '"PingFang SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"SimSun"', 'serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(140deg, #f4f2e7 0%, #dde8d2 30%, #b8d0a3 55%, #6e9a7a 80%, #1f2f2f 100%)',
        'mystical-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'golden-gradient': 'linear-gradient(135deg, #fde047 0%, #eab308 100%)',
        'divination-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2375a88d' fill-opacity='0.06'%3E%3Cpath d='M30 3l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM9 27l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM51 39l2 5 5 2-5 2-2 5-2-5-5-2 5-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rotate-slow': 'rotate 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'coin-flip-3d': 'coinFlip3D var(--duration) linear',
        'coin-toss-arc': 'coinTossArc var(--duration) ease-in-out',
        'coin-glow': 'coinGlow var(--duration) ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
            transform: 'scale(1)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.8)',
            transform: 'scale(1.05)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // 铜钱翻转动画 - 支持CSS变量
        coinFlip3D: {
          '0%': {
            transform: 'rotateX(0deg) rotateY(0deg)',
            opacity: '1'
          },
          '100%': {
            transform: 'rotateX(var(--rx-end)) rotateY(0deg)',
            opacity: '1'
          }
        },
        // 简化抛物线轨迹
        coinTossArc: {
          '0%': {
            transform: 'translateY(0px) translateX(0px)',
            opacity: '1'
          },
          '50%': {
            transform: 'translateY(-120px) translateX(40px)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateY(0px) translateX(0px)',
            opacity: '1'
          }
        },
        // 落地弹跳效果
        coinBounce: {
          '0%': {
            transform: 'translateY(0px) scale(1)',
          },
          '20%': {
            transform: 'translateY(-8px) scale(1.02, 0.98)',
          },
          '40%': {
            transform: 'translateY(-12px) scale(1.01, 0.99)',
          },
          '60%': {
            transform: 'translateY(-6px) scale(1.005, 0.995)',
          },
          '80%': {
            transform: 'translateY(-2px) scale(1.002, 0.998)',
          },
          '100%': {
            transform: 'translateY(0px) scale(1)',
          }
        },
        // 简化光晕脉动
        glowPulse: {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 20px rgba(217, 119, 6, 0.6))',
          },
          '50%': {
            filter: 'brightness(1.3) drop-shadow(0 0 30px rgba(217, 119, 6, 0.9))',
          }
        },
        // 铜钱光晕动画
        coinGlow: {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(217, 119, 6, 0)'
          },
          '50%': {
            boxShadow: '0 0 30px 10px rgba(217, 119, 6, 0.6)'
          }
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.5)',
        'mystical': '0 4px 20px rgba(79, 70, 229, 0.3)',
        'golden': '0 4px 20px rgba(234, 179, 8, 0.3)',
      },
    },
  },
  plugins: [],
}
