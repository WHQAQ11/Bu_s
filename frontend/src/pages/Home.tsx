import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TaiJi,
  BaGua,
  Stars,
  MysticalAura,
  SmallBaguaIcon,
} from "@/components/ui/TrigramSymbol";
import { ClassicBaguaDiagram } from "@/components/ui/ClassicBagua";

const Home: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // 占卜方法数据
  const divinationMethods = [
    {
      id: "liuyao",
      name: "六爻占卜",
      icon: "🔮",
      description: "通过掷币六次，洞察事物发展变化",
      gradient: "from-mystical-purple to-mystical-indigo",
      features: ["传统正宗", "细致入微", "时机把握"],
    },
    {
      id: "meihua",
      name: "梅花易数",
      icon: "✨",
      description: "观物取象，数字起卦，快速决策",
      gradient: "from-golden-400 to-golden-600",
      features: ["简单快捷", "直观易懂", "灵活多变"],
    },
    {
      id: "ai",
      name: "AI解卦",
      icon: "🧠",
      description: "智能解读，提供个性化行动指南",
      gradient: "from-mystical-teal to-mystical-rose",
      features: ["科技赋能", "个性定制", "深度分析"],
    },
  ];

  // 用户评价数据
  const testimonials = [
    {
      name: "李明",
      role: "创业者",
      content:
        "通过六爻占卜，我在关键时刻做出了正确的商业决策，避免了重大损失。",
      rating: 5,
      method: "六爻占卜",
    },
    {
      name: "王晓华",
      role: "设计师",
      content: "梅花易数帮我快速理清了职业发展方向的困惑，现在工作更有动力了。",
      rating: 5,
      method: "梅花易数",
    },
    {
      name: "张静",
      role: "教师",
      content: "AI解卦的分析非常深入，给出的建议既传统又现代，很有指导意义。",
      rating: 5,
      method: "AI解卦",
    },
  ];

  // 今日运势推荐
  const dailyFortune = {
    date: new Date().toLocaleDateString("zh-CN", {
      month: "long",
      day: "numeric",
    }),
    luckyNumbers: [3, 8, 21],
    luckyColor: "紫",
    fortune: "今天适合进行重要的决策和规划，贵人运旺盛，宜积极进取。",
  };

  // 轮播逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      {/* 星空背景 */}
      <Stars count={50} />

      {/* 主要内容 */}
      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
        <div className="text-center space-y-8">
          {/* 太极图和标题组合 */}
          <MysticalAura className="inline-block">
            <div className="flex flex-col items-center space-y-6">
              <ClassicBaguaDiagram size="md" className="mx-auto" />

              <div className="space-y-2">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-golden-400 via-golden-500 to-golden-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                  每日一卦
                </h1>
                <div className="flex justify-center space-x-4">
                  <BaGua trigram="乾" size="sm" className="text-golden-400" />
                  <BaGua trigram="坤" size="sm" className="text-golden-400" />
                  <BaGua trigram="震" size="sm" className="text-golden-400" />
                </div>
              </div>
            </div>
          </MysticalAura>

          {/* 副标题 */}
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-xl md:text-2xl text-midnight-100 font-light leading-relaxed">
              融合中华古老智慧与现代AI技术
            </p>
            <p className="text-lg text-midnight-200 font-serif italic">
              为您的人生指点迷津，探索命运的奥秘
            </p>
          </div>

          {/* 主要行动按钮 */}
          <div className="pt-8">
            <Link
              to="/divination"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`
                inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold
                bg-gradient-to-r from-mystical-purple to-mystical-indigo
                text-white rounded-full
                shadow-gold-lg hover:shadow-glow
                transform transition-all duration-500
                ${isHovered ? "scale-105 -translate-y-1" : "scale-100"}
                animate-float
              `}
            >
              <span>获取今日指引</span>
              <SmallBaguaIcon className={isHovered ? "animate-spin" : ""} />
            </Link>
          </div>

          {/* 今日运势推荐 */}
          <div className="max-w-2xl mx-auto pt-12">
            <MysticalAura className="bg-gradient-to-r from-mystical-purple/20 to-mystical-indigo/20 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/30">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-golden-400">今日运势</h3>
                <p className="text-sm text-midnight-300">{dailyFortune.date}</p>
                <p className="text-lg text-midnight-100 leading-relaxed">
                  {dailyFortune.fortune}
                </p>
                <div className="flex justify-center items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-midnight-400">幸运数字:</span>
                    <div className="flex space-x-1">
                      {dailyFortune.luckyNumbers.map((num, index) => (
                        <span
                          key={index}
                          className="w-6 h-6 bg-golden-400/20 text-golden-400 rounded-full flex items-center justify-center text-xs font-semibold"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-midnight-400">幸运色:</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                      {dailyFortune.luckyColor}
                    </span>
                  </div>
                </div>
              </div>
            </MysticalAura>
          </div>

          {/* 交互式占卜方法选择 */}
          <div className="max-w-5xl mx-auto pt-16">
            <h2 className="text-3xl font-bold text-center text-midnight-100 mb-12">
              选择您的占卜方式
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {divinationMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() =>
                    setSelectedMethod(
                      selectedMethod === method.id ? null : method.id,
                    )
                  }
                  className={`relative cursor-pointer transition-all duration-500 transform ${
                    selectedMethod === method.id
                      ? "scale-105 z-10"
                      : "hover:scale-102"
                  }`}
                >
                  <MysticalAura
                    className={`h-full bg-midnight-800/40 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 ${
                      selectedMethod === method.id
                        ? "border-golden-400 shadow-glow-lg"
                        : "border-primary-500/20 hover:border-primary-500/40"
                    }`}
                  >
                    <div className="text-center space-y-6">
                      {/* 图标 */}
                      <div
                        className={`w-16 h-16 mx-auto bg-gradient-to-br ${method.gradient} rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 ${
                          selectedMethod === method.id
                            ? "scale-110 animate-pulse"
                            : ""
                        }`}
                      >
                        <span className="text-3xl">{method.icon}</span>
                      </div>

                      {/* 标题和描述 */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-midnight-100">
                          {method.name}
                        </h3>
                        <p className="text-midnight-300 leading-relaxed">
                          {method.description}
                        </p>
                      </div>

                      {/* 特色标签 */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {method.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-primary-500/20 to-mystical-purple/20 text-golden-400 rounded-full text-xs font-medium border border-primary-500/30"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* 选择指示器 */}
                      {selectedMethod === method.id && (
                        <div className="flex items-center justify-center space-x-2 text-golden-400">
                          <span className="text-sm font-medium">已选择</span>
                          <svg
                            className="w-5 h-5"
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
                      )}
                    </div>
                  </MysticalAura>
                </div>
              ))}
            </div>

            {/* 选择后的行动按钮 */}
            {selectedMethod && (
              <div className="text-center mt-12 animate-fadeIn">
                <Link
                  to={`/divination?method=${selectedMethod}`}
                  className="inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-mystical-purple to-mystical-indigo text-white rounded-full shadow-glow-lg hover:shadow-glow transform hover:scale-105 transition-all duration-300"
                >
                  <span>
                    开始
                    {
                      divinationMethods.find((m) => m.id === selectedMethod)
                        ?.name
                    }
                  </span>
                  <TaiJi size="sm" className="animate-spin-slow" />
                </Link>
              </div>
            )}
          </div>

          {/* 用户评价轮播 */}
          <div className="pt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-midnight-100 mb-12">
              用户见证
            </h2>
            <div className="relative">
              <MysticalAura className="bg-midnight-800/30 backdrop-blur-sm rounded-2xl p-8 border border-primary-500/20">
                <div className="text-center space-y-6">
                  {/* 评分显示 */}
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className="w-6 h-6 text-golden-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* 评价内容 */}
                  <blockquote className="text-lg text-midnight-100 leading-relaxed italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>

                  {/* 用户信息 */}
                  <div className="space-y-2">
                    <p className="font-semibold text-midnight-100">
                      {testimonials[currentTestimonial].name}
                    </p>
                    <p className="text-sm text-midnight-300">
                      {testimonials[currentTestimonial].role} · 使用
                      {testimonials[currentTestimonial].method}
                    </p>
                  </div>

                  {/* 轮播指示器 */}
                  <div className="flex justify-center space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentTestimonial
                            ? "w-8 bg-golden-400"
                            : "bg-midnight-600 hover:bg-midnight-500"
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </MysticalAura>
            </div>
          </div>

          {/* 诗经引用 */}
          <div className="pt-16 max-w-2xl mx-auto">
            <MysticalAura className="text-center space-y-2">
              <p className="text-lg text-midnight-200 font-serif italic">
                "天行健，君子以自强不息"
              </p>
              <p className="text-sm text-midnight-400">——《周易·乾卦》</p>
            </MysticalAura>
          </div>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight-900 to-transparent"></div>
    </div>
  );
};

export default Home;
