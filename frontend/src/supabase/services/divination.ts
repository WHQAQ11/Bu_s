import { supabase } from './client'
import type { PostgrestError } from '@supabase/supabase-js'
import type { DivinationLog, UserStats } from '../types/supabase'
import type { CreateDivinationLogData } from '@/types/divination'

// 使用统一类型定义

export interface DivinationLogResponse {
  data: DivinationLog | null
  error: PostgrestError | null
}

export interface DivinationLogsResponse {
  data: DivinationLog[] | null
  error: PostgrestError | null
  count: number | null
}

export interface UserStatsResponse {
  data: UserStats | null
  error: PostgrestError | null
}

export class DivinationService {
  /**
   * 创建占卜记录
   */
  static async createDivinationLog(data: CreateDivinationLogData): Promise<DivinationLogResponse> {
    try {
      // 获取当前认证用户
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('获取用户信息失败:', authError || '用户未登录')
        return { data: null, error: { message: '用户未登录', details: '', hint: '', code: 'NOT_AUTHENTICATED' } as PostgrestError }
      }

      const { data: result, error } = await supabase
        .from('divination_logs')
        .insert([
          {
            user_id: user.id,
            method: data.method,
            question: data.question,
            category: data.category,
            original_hexagram: data.original_hexagram,
            transformed_hexagram: data.transformed_hexagram,
            changing_indexes: data.changing_indexes,
            ben_gua_info: data.ben_gua_info,
            bian_gua_info: data.bian_gua_info,
            ai_request_data: data.ai_request_data,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('创建占卜记录失败:', error)
        return { data: null, error }
      }

      return { data: result, error: null }
    } catch (error) {
      console.error('创建占卜记录异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 获取用户的占卜记录列表
   */
  static async getUserDivinationLogs(
    page = 1,
    pageSize = 10,
    filters?: {
      method?: 'liuyao' | 'meihua' | 'ai'
      category?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<DivinationLogsResponse> {
    try {
      let query = supabase
        .from('divination_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // 应用过滤条件
      if (filters?.method) {
        query = query.eq('method', filters.method)
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      // 分页
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('获取占卜记录失败:', error)
        return { data: null, error, count: null }
      }

      return { data, error: null, count }
    } catch (error) {
      console.error('获取占卜记录异常:', error)
      return { data: null, error: error as PostgrestError, count: null }
    }
  }

  /**
   * 根据ID获取占卜记录详情
   */
  static async getDivinationLogById(id: string): Promise<DivinationLogResponse> {
    try {
      const { data, error } = await supabase
        .from('divination_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('获取占卜记录详情失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('获取占卜记录详情异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 更新占卜记录的AI解读
   */
  static async updateAIInterpretation(
    id: string,
    aiInterpretation: string,
    aiResponseData?: any
  ): Promise<DivinationLogResponse> {
    try {
      const updateData: any = {
        ai_interpretation: aiInterpretation,
        updated_at: new Date().toISOString(),
      }

      if (aiResponseData) {
        updateData.ai_response_data = aiResponseData
      }

      const { data, error } = await supabase
        .from('divination_logs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('更新AI解读失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('更新AI解读异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 更新占卜记录的解读状态
   */
  static async updateInterpretationStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<DivinationLogResponse> {
    try {
      const { data, error } = await supabase
        .from('divination_logs')
        .update({
          interpretation_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('更新解读状态失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('更新解读状态异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 删除占卜记录
   */
  static async deleteDivinationLog(id: string): Promise<{ error: PostgrestError | null }> {
    try {
      const { error } = await supabase
        .from('divination_logs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('删除占卜记录失败:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('删除占卜记录异常:', error)
      return { error: error as PostgrestError }
    }
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(userId?: string): Promise<UserStatsResponse> {
    try {
      let query = supabase
        .from('user_stats')
        .select('*')

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        // 如果没有提供userId，获取当前用户的统计
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return { data: null, error: { message: '用户未登录', details: '', hint: '', code: 'NOT_AUTHENTICATED' } as PostgrestError }
        }
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('获取用户统计失败:', error)
        return { data: null, error }
      }

      return { data: data || null, error: null }
    } catch (error) {
      console.error('获取用户统计异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 获取占卜记录统计信息
   */
  static async getDivinationStats(userId?: string): Promise<{
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
      let query = supabase
        .from('divination_logs')
        .select('method, category, created_at')

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          query = query.eq('user_id', user.id)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('获取占卜统计失败:', error)
        return null
      }

      if (!data || data.length === 0) {
        return {
          totalDivinations: 0,
          methodStats: { liuyao: 0, meihua: 0, ai: 0 },
          categoryStats: {},
          recentCount: 0,
        }
      }

      // 统计各种数据
      const stats = {
        totalDivinations: data.length,
        methodStats: {
          liuyao: data.filter(d => d.method === 'liuyao').length,
          meihua: data.filter(d => d.method === 'meihua').length,
          ai: data.filter(d => d.method === 'ai').length,
        },
        categoryStats: {} as Record<string, number>,
        recentCount: 0,
      }

      // 统计分类
      data.forEach(divination => {
        if (divination.category) {
          stats.categoryStats[divination.category] =
            (stats.categoryStats[divination.category] || 0) + 1
        }
      })

      // 统计最近7天的占卜数量
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      stats.recentCount = data.filter(d =>
        new Date(d.created_at) >= sevenDaysAgo
      ).length

      return stats
    } catch (error) {
      console.error('获取占卜统计异常:', error)
      return null
    }
  }

  /**
   * 批量删除占卜记录
   */
  static async deleteDivinationLogs(ids: string[]): Promise<{ error: PostgrestError | null }> {
    try {
      const { error } = await supabase
        .from('divination_logs')
        .delete()
        .in('id', ids)

      if (error) {
        console.error('批量删除占卜记录失败:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('批量删除占卜记录异常:', error)
      return { error: error as PostgrestError }
    }
  }
}
