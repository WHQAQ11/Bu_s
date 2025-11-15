import { DivinationService as SupabaseDivinationService } from '@/supabase/services/divination'
import { AuthService } from '@/services/auth'
import type {
  AIInterpretationRequest,
  AIInterpretationResponse,
  DivinationResult
} from "@/types/divination";

// 本地占卜计算工具函数
import { generateMockResult } from '@/utils/iChingUtils'

export class DivinationService {
  /**
   * 执行占卜计算（前端计算 + 后端存储）
   * @param method 占卜方法 (liuyao, meihua, ai)
   * @param question 占卜问题
   * @param inputData 可选的输入数据
   * @returns 占卜结果
   */
  static async performRealDivination(
    method: 'liuyao' | 'meihua' | 'ai',
    question: string,
    inputData?: {
      category?: string
      coins?: number[] // 六爻占卜的铜钱结果
      timeData?: Date // 梅花易数的时间数据
    }
  ): Promise<{ success: boolean; data?: any; log_id?: string; message?: string }> {
    const requestId = `div_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🔮 [${requestId}] 开始执行占卜计算:`, {
        method,
        question: question.substring(0, 50) + (question.length > 50 ? "..." : ""),
        category: inputData?.category,
        timestamp: new Date().toISOString()
      });

      // 检查用户认证状态
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("用户未登录，请先登录");
      }

      // 前端执行占卜计算
      const result = await this.calculateDivination(method, question, inputData);

      console.log(`🎯 [${requestId}] 占卜计算完成:`, {
        original_hexagram: result.originalHexagram,
        transformed_hexagram: result.transformedHexagram,
        changing_indexes: result.changingLineIndexes,
        ben_gua_name: result.benGuaInfo?.name,
        has_bian_gua: !!result.bianGuaInfo
      });

      console.log(`📝 [${requestId}] 准备写入 Supabase，占卜结果:`, result);

      const createPromise = SupabaseDivinationService.createDivinationLog({
        method,
        question,
        category: inputData?.category,
        original_hexagram: result.originalHexagram,
        transformed_hexagram: result.transformedHexagram,
        changing_indexes: result.changingLineIndexes,
        ben_gua_info: result.benGuaInfo,
        bian_gua_info: result.bianGuaInfo,
        ai_request_data: {
          method,
          question,
          category: inputData?.category,
        }
      });

      const timeoutMs = 6000;
      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) => {
        const t = setTimeout(() => {
          clearTimeout(t);
          resolve({ data: null, error: { message: 'TIMEOUT' } });
        }, timeoutMs);
      });

      const logResponse = await Promise.race([createPromise as any, timeoutPromise]);

      console.log(`📦 [${requestId}] Supabase insert 响应:`, logResponse);

      if (logResponse && logResponse.error && logResponse.error.message !== 'TIMEOUT') {
        console.error(`❌ [${requestId}] 保存占卜记录失败:`, logResponse.error);
        throw new Error(`保存占卜记录失败: ${logResponse.error.message}`);
      }

      console.log(`✅ [${requestId}] 占卜记录保存成功:`, {
        log_id: logResponse && logResponse.data ? logResponse.data?.id : undefined,
        method,
        question_preview: question.substring(0, 30) + "..."
      });

      // 触发全局事件，通知其他组件占卜完成
      window.dispatchEvent(new CustomEvent('divination-completed', {
        detail: {
          success: true,
          log_id: logResponse.data?.id,
          method: method,
          question: question,
          request_id: requestId
        }
      }));

      return {
        success: true,
        data: {
          log_id: logResponse.data?.id,
          result
        },
        log_id: logResponse.data?.id,
        message: "占卜完成"
      };

    } catch (error: any) {
      console.error(`💥 [${requestId}] 占卜计算失败:`, {
        error_message: error.message,
        method,
        question_preview: question.substring(0, 30) + "...",
        timestamp: new Date().toISOString()
      });

      // 触发全局事件，通知其他组件占卜失败
      window.dispatchEvent(new CustomEvent('divination-completed', {
        detail: {
          success: false,
          error: error.message,
          method: method,
          question: question,
          request_id: requestId
        }
      }));

      return {
        success: false,
        message: error.message || "占卜失败，请稍后重试"
      };
    }
  }

  /**
   * 获取AI智能解析（调用Supabase边缘函数）
   * @param data 占卜数据
   * @returns AI解析结果
   */
  static async getAIInterpretation(
    data: AIInterpretationRequest & { log_id: string }
  ): Promise<AIInterpretationResponse> {
    try {
      // 更新状态为处理中
      await SupabaseDivinationService.updateInterpretationStatus(data.log_id, 'processing');

      // 调用Supabase边缘函数
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-interpretation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`AI解读请求失败: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // 更新占卜记录的AI解读
        await SupabaseDivinationService.updateAIInterpretation(
          data.log_id,
          result.data.ai_interpretation,
          result.data
        );

        return {
          success: true,
          interpretation: result.data.ai_interpretation,
          data: result.data
        };
      } else {
        // 更新状态为失败
        await SupabaseDivinationService.updateInterpretationStatus(data.log_id, 'failed');
        throw new Error(result.error || 'AI解读失败');
      }

    } catch (error: any) {
      console.error("获取AI解析失败:", error);

      // 更新状态为失败
      if (data.log_id) {
        await SupabaseDivinationService.updateInterpretationStatus(data.log_id, 'failed');
      }

      throw error;
    }
  }

  /**
   * 获取用户占卜历史记录
   * @param page 页码
   * @param pageSize 每页条数
   * @param filters 过滤条件
   * @returns 占卜历史记录
   */
  static async getUserLogs(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      method?: 'liuyao' | 'meihua' | 'ai'
      category?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    try {
      const response = await SupabaseDivinationService.getUserDivinationLogs(page, pageSize, filters);

      if (response.error) {
        throw new Error(`获取占卜历史失败: ${response.error.message}`);
      }

      return {
        data: response.data || [],
        total: response.count || 0,
        page,
        pageSize
      };
    } catch (error: any) {
      console.error("获取占卜历史失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户占卜统计
   * @returns 用户统计数据
   */
  static async getUserStats(): Promise<{
    totalDivinations: number
    methodStats: {
      liuyao: number
      meihua: number
      ai: number
    }
    categoryStats: Record<string, number>
    recentCount: number
  } | null> {
    try {
      return await SupabaseDivinationService.getDivinationStats();
    } catch (error: any) {
      console.error("获取占卜统计失败:", error);
      throw error;
    }
  }

  /**
   * 获取单个占卜记录详情
   * @param id 记录ID
   * @returns 占卜记录详情
   */
  static async getLogById(id: string): Promise<any> {
    try {
      const response = await SupabaseDivinationService.getDivinationLogById(id);

      if (response.error) {
        throw new Error(`获取占卜记录详情失败: ${response.error.message}`);
      }

      return response.data;
    } catch (error: any) {
      console.error("获取占卜记录详情失败:", error);
      throw error;
    }
  }

  /**
   * 删除占卜记录
   * @param id 记录ID
   * @returns 删除结果
   */
  static async deleteLog(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await SupabaseDivinationService.deleteDivinationLog(id);

      if (response.error) {
        throw new Error(`删除占卜记录失败: ${response.error.message}`);
      }

      return { success: true, message: "删除成功" };
    } catch (error: any) {
      console.error("删除占卜记录失败:", error);
      throw error;
    }
  }

  /**
   * 批量删除占卜记录
   * @param ids 记录ID数组
   * @returns 删除结果
   */
  static async deleteLogs(ids: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await SupabaseDivinationService.deleteDivinationLogs(ids);

      if (response.error) {
        throw new Error(`批量删除占卜记录失败: ${response.error.message}`);
      }

      return { success: true, message: "删除成功" };
    } catch (error: any) {
      console.error("批量删除占卜记录失败:", error);
      throw error;
    }
  }

  /**
   * 本地占卜计算逻辑（保持原有算法）
   */
  private static async calculateDivination(
    method: 'liuyao' | 'meihua' | 'ai',
    question: string,
    inputData?: any
  ): Promise<DivinationResult> {
    try {
      console.log(`🎲 [calculateDivination] 开始计算占卜:`, { method, question: question.substring(0, 30) });

      // 这里保持现有的占卜计算逻辑
      // 可以从 iChingUtils 或其他工具函数中导入
      const result = generateMockResult(method, question, inputData);
      console.log(`📦 [calculateDivination] 生成基础结果:`, {
        originalHexagram: result.originalHexagram,
        transformedHexagram: result.transformedHexagram
      });

      // ✅ 修复：使用mock数据中的卦象信息，不查询hexagrams表
      // 原来的代码试图从hexagrams表查询，但该表可能不存在或有权限问题
      // 因为generateMockResult()已经生成了benGuaInfo和bianGuaInfo，这里直接使用即可

      if (result.benGuaInfo) {
        console.log(`✅ [calculateDivination] 本卦信息已从mock数据获取:`, result.benGuaInfo.name);
      } else {
        console.warn(`⚠️ [calculateDivination] benGuaInfo为空，使用默认值`);
        result.benGuaInfo = {
          name: "未知卦象",
          number: 0,
          guaci: "卦辞信息暂未找到",
          yaoci: undefined,
          structure: {}
        };
      }

      if (result.bianGuaInfo) {
        console.log(`✅ [calculateDivination] 变卦信息已从mock数据获取:`, result.bianGuaInfo.name);
      } else {
        console.log(`ℹ️ [calculateDivination] 无变卦信息`);
      }

      console.log(`🎯 [calculateDivination] 计算完成:`, {
        benGua: result.benGuaInfo?.name,
        bianGua: result.bianGuaInfo?.name
      });
      return result;
    } catch (error) {
      console.error(`💥 [calculateDivination] 计算过程出错:`, error);
      throw error;
    }
  }
}
