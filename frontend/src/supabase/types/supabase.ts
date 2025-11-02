// Supabase数据库表类型定义

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nickname?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_divinations: number
          liuyao_count: number
          meihua_count: number
          ai_count: number
          last_divination_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_divinations?: number
          liuyao_count?: number
          meihua_count?: number
          ai_count?: number
          last_divination_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          total_divinations?: number
          liuyao_count?: number
          meihua_count?: number
          ai_count?: number
          last_divination_date?: string | null
          updated_at?: string
        }
      }
      hexagrams: {
        Row: {
          id: number
          hexagram_key: string
          name: string
          pinyin: string | null
          number: number
          guaci_original: string | null
          guaci_translation: string | null
          guaci_interpretation: string | null
          yaoci: any[] | null
          structure: any
          source: any
          references: any[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          hexagram_key: string
          name: string
          pinyin?: string | null
          number: number
          guaci_original?: string | null
          guaci_translation?: string | null
          guaci_interpretation?: string | null
          yaoci?: any[] | null
          structure?: any
          source?: any
          references?: any[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          hexagram_key?: string
          name?: string
          pinyin?: string | null
          number?: number
          guaci_original?: string | null
          guaci_translation?: string | null
          guaci_interpretation?: string | null
          yaoci?: any[] | null
          structure?: any
          source?: any
          references?: any[] | null
          updated_at?: string
        }
      }
      divination_logs: {
        Row: {
          id: string
          user_id: string
          method: 'liuyao' | 'meihua' | 'ai'
          question: string
          category: string | null
          original_hexagram: string
          transformed_hexagram: string | null
          changing_indexes: number[] | null
          ben_gua_info: any
          bian_gua_info: any
          ai_interpretation: string | null
          interpretation_status: 'pending' | 'processing' | 'completed' | 'failed'
          ai_request_data: any
          ai_response_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          method: 'liuyao' | 'meihua' | 'ai'
          question: string
          category?: string | null
          original_hexagram: string
          transformed_hexagram?: string | null
          changing_indexes?: number[] | null
          ben_gua_info: any
          bian_gua_info?: any
          ai_interpretation?: string | null
          interpretation_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_request_data?: any
          ai_response_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          method?: 'liuyao' | 'meihua' | 'ai'
          question?: string
          category?: string | null
          original_hexagram?: string
          transformed_hexagram?: string | null
          changing_indexes?: number[] | null
          ben_gua_info?: any
          bian_gua_info?: any
          ai_interpretation?: string | null
          interpretation_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_request_data?: any
          ai_response_data?: any
          updated_at?: string
        }
      }
    }
  }
}

// 导出便捷类型
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type UserStats = Database['public']['Tables']['user_stats']['Row']
export type UserStatsInsert = Database['public']['Tables']['user_stats']['Insert']
export type UserStatsUpdate = Database['public']['Tables']['user_stats']['Update']
export type HexagramInfo = Database['public']['Tables']['hexagrams']['Row']
export type HexagramInsert = Database['public']['Tables']['hexagrams']['Insert']
export type HexagramUpdate = Database['public']['Tables']['hexagrams']['Update']
export type DivinationLog = Database['public']['Tables']['divination_logs']['Row']
export type DivinationLogInsert = Database['public']['Tables']['divination_logs']['Insert']
export type DivinationLogUpdate = Database['public']['Tables']['divination_logs']['Update']