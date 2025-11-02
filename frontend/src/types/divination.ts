// 占卜相关类型定义

// 占卜方法类型
export type DivinationMethod = 'liuyao' | 'meihua' | 'ai';

// 统一的占卜结果接口
export interface DivinationResult {
  // 基础信息
  method: DivinationMethod;
  question: string;
  category?: string;
  timestamp: string;

  // 卦象信息 - 支持两种格式
  // 格式1：字符串键值（数据库存储格式）
  originalHexagram: string;
  transformedHexagram?: string;
  changingLineIndexes: number[];

  // 格式2：数字数组（动画组件格式，可选）
  originalHexagramArray?: number[];
  transformedHexagramArray?: number[];

  // 卦象详细信息
  benGuaInfo?: {
    name: string;
    number: number;
    guaci?: string;
    yaoci?: string[];
    upperTrigram?: string;
    lowerTrigram?: string;
    structure?: any;
    [key: string]: any;
  };
  bianGuaInfo?: {
    name: string;
    number: number;
    guaci?: string;
    yaoci?: string[];
    upperTrigram?: string;
    lowerTrigram?: string;
    structure?: any;
    [key: string]: any;
  };

  // 元数据
  isRealResult?: boolean;
  apiError?: string;

  // 向后兼容字段（旧格式）
  result?: {
    name: string;
    number: number;
    upperTrigram: string;
    lowerTrigram: string;
    changingYao?: number;
    interpretation: {
      guaci: string;
      yaoci?: string[];
      shiyi?: string;
      analysis?: string;
    };
    aiInterpretation?: string;
    timestamp?: string;
  };
  aiInterpretation?: string;
}

// AI解析请求接口（匹配Supabase边缘函数）
export interface AIInterpretationRequest {
  method: string;
  question: string;
  hexagram_name: string;
  hexagram_info: {
    upperTrigram?: string;
    lowerTrigram?: string;
    guaci?: string;
    yaoci?: string[];
    interpretation?: string;
    [key: string]: any;
  };
  // 可选参数
  style?: 'traditional' | 'modern' | 'detailed' | 'concise';
  focus?: 'career' | 'relationship' | 'health' | 'wealth' | 'general';
  language?: 'chinese' | 'bilingual';
  // Supabase边缘函数需要的参数
  log_id: string;
  category?: string;
}

// AI解析响应接口
export interface AIInterpretationResponse {
  success: boolean;
  interpretation?: string;
  data?: {
    ai_interpretation: string;
    model_used?: string;
    processing_time?: number;
    token_usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: string;
  message?: string;
}

// 占卜日志项（从数据库获取）
export interface DivinationLogItem {
  id: string;
  user_id: string;
  method: DivinationMethod;
  question: string;
  category?: string;
  original_hexagram: string;
  transformed_hexagram?: string;
  changing_indexes?: number[];
  ben_gua_info?: any;
  bian_gua_info?: any;
  ai_interpretation?: string;
  interpretation_status?: 'pending' | 'processing' | 'completed' | 'failed';
  ai_response_data?: any;
  created_at: string;
  updated_at: string;
}

// 用户占卜统计
export interface DivinationStats {
  totalDivinations: number;
  methodStats: {
    liuyao: number;
    meihua: number;
    ai: number;
  };
  categoryStats: Record<string, number>;
  recentCount: number;
}

// 占卜历史查询参数
export interface DivinationLogFilters {
  method?: DivinationMethod;
  category?: string;
  startDate?: string;
  endDate?: string;
}

// 占卜历史查询结果
export interface DivinationLogsResponse {
  data: DivinationLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 创建占卜记录请求数据
export interface CreateDivinationLogData {
  method: DivinationMethod;
  question: string;
  category?: string;
  original_hexagram: string;
  transformed_hexagram?: string;
  changing_indexes?: number[];
  ben_gua_info?: any;
  bian_gua_info?: any;
  ai_request_data?: any;
}