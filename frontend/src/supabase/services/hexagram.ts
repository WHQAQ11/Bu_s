import { supabase } from './client'
import type { PostgrestError } from '@supabase/supabase-js'
import type { HexagramInfo } from '../types/supabase'

export interface HexagramResponse {
  data: HexagramInfo | null
  error: PostgrestError | null
}

export interface HexagramsResponse {
  data: HexagramInfo[] | null
  error: PostgrestError | null
}

export class HexagramService {
  /**
   * 根据卦象键值获取卦象信息
   */
  static async getHexagramByKey(hexagramKey: string): Promise<HexagramResponse> {
    try {
      const { data, error } = await supabase
        .from('hexagrams')
        .select('*')
        .eq('hexagram_key', hexagramKey)
        .single()

      if (error) {
        console.error('获取卦象信息失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('获取卦象信息异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 根据卦象序号获取卦象信息
   */
  static async getHexagramByNumber(number: number): Promise<HexagramResponse> {
    try {
      const { data, error } = await supabase
        .from('hexagrams')
        .select('*')
        .eq('number', number)
        .single()

      if (error) {
        console.error('根据序号获取卦象失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('根据序号获取卦象异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 根据卦象名称获取卦象信息
   */
  static async getHexagramByName(name: string): Promise<HexagramResponse> {
    try {
      const { data, error } = await supabase
        .from('hexagrams')
        .select('*')
        .eq('name', name)
        .single()

      if (error) {
        console.error('根据名称获取卦象失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('根据名称获取卦象异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 获取所有卦象列表
   */
  static async getAllHexagrams(): Promise<HexagramsResponse> {
    try {
      const { data, error } = await supabase
        .from('hexagrams')
        .select('*')
        .order('number', { ascending: true })

      if (error) {
        console.error('获取所有卦象失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('获取所有卦象异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 搜索卦象
   */
  static async searchHexagrams(keyword: string): Promise<HexagramsResponse> {
    try {
      const { data, error } = await supabase
        .from('hexagrams')
        .select('*')
        .or(`name.ilike.%${keyword}%,pinyin.ilike.%${keyword}%,guaci_original.ilike.%${keyword}%`)
        .order('number', { ascending: true })

      if (error) {
        console.error('搜索卦象失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('搜索卦象异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 根据爻值数组计算卦象键值
   */
  static calculateHexagramKey(yaoValues: number[]): string {
    if (yaoValues.length !== 6) {
      throw new Error('爻值数组长度必须为6')
    }

    return yaoValues.map(value => {
      // 转换爻值：老阳(9)和少阳(7)为阳爻(1)，老阴(6)和少阴(8)为阴爻(0)
      return (value === 9 || value === 7) ? '1' : '0'
    }).join('')
  }

  /**
   * 根据卦象键值计算变卦键值
   */
  static calculateTransformedHexagramKey(
    originalKey: string,
    changingIndexes: number[]
  ): string {
    if (originalKey.length !== 6) {
      throw new Error('卦象键值长度必须为6')
    }

    const chars = originalKey.split('')
    changingIndexes.forEach(index => {
      if (index >= 0 && index < 6) {
        // 变爻：阳爻变阴爻，阴爻变阳爻
        chars[index] = chars[index] === '1' ? '0' : '1'
      }
    })

    return chars.join('')
  }

  /**
   * 获取互卦信息（取本卦的二三四五爻组成新卦）
   */
  static getMutualHexagramKey(hexagramKey: string): string {
    if (hexagramKey.length !== 6) {
      throw new Error('卦象键值长度必须为6')
    }

    // 互卦：取本卦的第2、3、4、5爻（索引1-4）
    return hexagramKey.substring(1, 5)
  }

  /**
   * 获取错卦信息（阴阳完全相反的卦）
   */
  static getOppositeHexagramKey(hexagramKey: string): string {
    if (hexagramKey.length !== 6) {
      throw new Error('卦象键值长度必须为6')
    }

    return hexagramKey.split('').map(char => char === '1' ? '0' : '1').join('')
  }

  /**
   * 获取综卦信息（倒转过来的卦）
   */
  static getReversedHexagramKey(hexagramKey: string): string {
    if (hexagramKey.length !== 6) {
      throw new Error('卦象键值长度必须为6')
    }

    return hexagramKey.split('').reverse().join('')
  }

  /**
   * 批量获取卦象信息
   */
  static async getHexagramsByKeys(hexagramKeys: string[]): Promise<HexagramsResponse> {
    try {
      const { data, error } = await supabase
        .from('hexagrams')
        .select('*')
        .in('hexagram_key', hexagramKeys)

      if (error) {
        console.error('批量获取卦象失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('批量获取卦象异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 根据上下卦获取卦象列表
   */
  static async getHexagramsByTrigrams(
    upperTrigram: string,
    lowerTrigram?: string
  ): Promise<HexagramsResponse> {
    try {
      let query = supabase
        .from('hexagrams')
        .select('*')

      if (upperTrigram && lowerTrigram) {
        // 精确匹配上下卦
        query = query
          .contains('structure', { upper_trigram: upperTrigram, lower_trigram: lowerTrigram })
      } else if (upperTrigram) {
        // 只匹配上卦
        query = query
          .contains('structure', { upper_trigram: upperTrigram })
      }

      const { data, error } = await query.order('number', { ascending: true })

      if (error) {
        console.error('根据上下卦获取卦象失败:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('根据上下卦获取卦象异常:', error)
      return { data: null, error: error as PostgrestError }
    }
  }

  /**
   * 获取卦象的完整解读信息
   */
  static async getCompleteHexagramInfo(hexagramKey: string): Promise<{
    benGua: HexagramInfo | null
    bianGua: HexagramInfo | null
    mutualGua: HexagramInfo | null
    oppositeGua: HexagramInfo | null
    reversedGua: HexagramInfo | null
  } | null> {
    try {
      // 获取本卦
      const benGuaResponse = await this.getHexagramByKey(hexagramKey)
      if (!benGuaResponse.data) {
        return null
      }

      // 计算相关卦象的键值
      const benGua = benGuaResponse.data
      const oppositeKey = this.getOppositeHexagramKey(hexagramKey)
      const reversedKey = this.getReversedHexagramKey(hexagramKey)
      const mutualKey = this.getMutualHexagramKey(hexagramKey)

      // 批量获取相关卦象
      const keysToQuery = [oppositeKey, reversedKey, mutualKey].filter(key => key !== hexagramKey)
      const relatedHexagramsResponse = await this.getHexagramsByKeys(keysToQuery)

      const result = {
        benGua,
        bianGua: null as HexagramInfo | null, // 变卦需要根据占卜结果确定
        mutualGua: null as HexagramInfo | null,
        oppositeGua: null as HexagramInfo | null,
        reversedGua: null as HexagramInfo | null,
      }

      if (relatedHexagramsResponse.data) {
        relatedHexagramsResponse.data.forEach(hexagram => {
          if (hexagram.hexagram_key === oppositeKey) {
            result.oppositeGua = hexagram
          } else if (hexagram.hexagram_key === reversedKey) {
            result.reversedGua = hexagram
          } else if (hexagram.hexagram_key === mutualKey) {
            result.mutualGua = hexagram
          }
        })
      }

      return result
    } catch (error) {
      console.error('获取完整卦象信息异常:', error)
      return null
    }
  }
}