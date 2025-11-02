import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI模型配置
interface AIConfig {
  model: string
  apiKey: string
  baseUrl?: string
}

// 请求接口
interface AIInterpretationRequest {
  method: string
  question: string
  hexagram_name: string
  hexagram_info: {
    upperTrigram?: string
    lowerTrigram?: string
    guaci?: string
    yaoci?: string[]
    interpretation?: string
    [key: string]: any
  }
  category?: string
  style?: 'traditional' | 'modern' | 'detailed' | 'concise'
  focus?: 'career' | 'relationship' | 'health' | 'wealth' | 'general'
  language?: 'chinese' | 'bilingual'
  log_id: string
}

// 响应接口
interface AIInterpretationResponse {
  success: boolean
  data?: {
    ai_interpretation: string
    model_used?: string
    processing_time?: number
    token_usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
  error?: string
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 初始化 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 解析请求体
    const requestData: AIInterpretationRequest = await req.json()

    console.log('🤖 AI解读请求:', {
      method: requestData.method,
      question: requestData.question.substring(0, 50) + '...',
      hexagram: requestData.hexagram_name,
      category: requestData.category,
      style: requestData.style || 'detailed',
      log_id: requestData.log_id
    })

    // 验证必要参数
    if (!requestData.question || !requestData.hexagram_name || !requestData.hexagram_info) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '缺少必要参数：question, hexagram_name, hexagram_info'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // 获取AI配置
    const aiConfig: AIConfig = {
      model: Deno.env.get('AI_MODEL') || 'gpt-3.5-turbo',
      apiKey: Deno.env.get('AI_API_KEY') || '',
      baseUrl: Deno.env.get('AI_BASE_URL')
    }

    if (!aiConfig.apiKey) {
      console.error('❌ AI API密钥未配置')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI服务配置错误'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // 更新占卜记录状态为处理中
    await supabase
      .from('divination_logs')
      .update({
        interpretation_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.log_id)

    // 生成AI解读
    const startTime = Date.now()
    const aiResult = await generateAIInterpretation(requestData, aiConfig)
    const processingTime = Date.now() - startTime

    console.log('✅ AI解读完成:', {
      log_id: requestData.log_id,
      processing_time: processingTime,
      model: aiConfig.model,
      interpretation_length: aiResult.length
    })

    // 保存结果到数据库
    const updateData = {
      ai_interpretation: aiResult.interpretation,
      interpretation_status: 'completed',
      ai_response_data: {
        model_used: aiConfig.model,
        processing_time,
        token_usage: aiResult.tokenUsage,
        timestamp: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('divination_logs')
      .update(updateData)
      .eq('id', requestData.log_id)

    if (updateError) {
      console.error('❌ 保存AI解读失败:', updateError)
      // 即使保存失败，也返回解读结果
    }

    // 返回结果
    const response: AIInterpretationResponse = {
      success: true,
      data: {
        ai_interpretation: aiResult.interpretation,
        model_used: aiConfig.model,
        processing_time: processingTime,
        token_usage: aiResult.tokenUsage
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 AI解读服务错误:', error)

    // 更新状态为失败
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const requestData = await req.json()
      await supabase
        .from('divination_logs')
        .update({
          interpretation_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestData.log_id)
    } catch (updateError) {
      console.error('❌ 更新失败状态出错:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'AI解读服务内部错误'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/**
 * 生成AI解读
 */
async function generateAIInterpretation(
  request: AIInterpretationRequest,
  config: AIConfig
): Promise<{
  interpretation: string
  tokenUsage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}> {
  const style = request.style || 'detailed'
  const focus = request.focus || 'general'
  const language = request.language || 'chinese'

  // 构建提示词
  const systemPrompt = buildSystemPrompt(style, focus, language)
  const userPrompt = buildUserPrompt(request)

  // 调用AI模型
  const result = await callAIModel(systemPrompt, userPrompt, config)

  return {
    interpretation: result.content,
    tokenUsage: result.tokenUsage
  }
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(style: string, focus: string, language: string): string {
  const basePrompt = language === 'chinese'
    ? '你是一位精通易经的占卜大师，具有深厚的传统文化底蕴和现代心理学知识。'
    : 'You are an I Ching master with deep knowledge of traditional Chinese culture and modern psychology.'

  const styleInstructions = {
    traditional: language === 'chinese'
      ? '请以传统易经解读的方式回答，引用古籍原文，注重卦辞、爻辞的传统解释。'
      : 'Please provide traditional I Ching interpretations, quoting ancient texts and focusing on traditional explanations of hexagram judgments and line statements.',
    modern: language === 'chinese'
      ? '请用现代心理学和生活智慧来解读卦象，让古典智慧与现代生活相结合。'
      : 'Please interpret the hexagram using modern psychology and life wisdom, combining classical wisdom with contemporary life.',
    detailed: language === 'chinese'
      ? '请提供详细全面的解读，包括本卦、变卦、互卦的综合分析，以及具体的行动建议。'
      : 'Please provide comprehensive interpretation including analysis of the primary hexagram, transformed hexagram, and nuclear hexagram, with specific action recommendations.',
    concise: language === 'chinese'
      ? '请提供简洁明了的核心解读，突出重点，易于理解和记忆。'
      : 'Please provide concise and clear core interpretation, highlighting key points for easy understanding and memory.'
  }

  const focusInstructions = {
    career: language === 'chinese'
      ? '特别关注职业发展、工作前景、人际关系等方面。'
      : 'Pay special attention to career development, job prospects, and workplace relationships.',
    relationship: language === 'chinese'
      ? '特别关注感情关系、家庭和谐、人际互动等方面。'
      : 'Pay special attention to romantic relationships, family harmony, and interpersonal interactions.',
    health: language === 'chinese'
      ? '特别关注身体健康、心理状态、养生保健等方面。'
      : 'Pay special attention to physical health, mental state, and wellness.',
    wealth: language === 'chinese'
      ? '特别关注财运发展、投资理财、财富管理等方面。'
      : 'Pay special attention to financial development, investment, and wealth management.',
    general: language === 'chinese'
      ? '提供全面综合的解读，涵盖生活的各个方面。'
      : 'Provide comprehensive interpretation covering all aspects of life.'
  }

  return `${basePrompt}

${styleInstructions[style] || styleInstructions.detailed}

${focusInstructions[focus] || focusInstructions.general}

回答要求：
1. 结合具体问题进行分析
2. 融合传统易经智慧与现代理解
3. 给出实用、可操作的建议
4. 保持语言的准确性和指导性
5. 字数控制在300-800字之间

回答格式：
【卦象解析】
【问题解读】
【行动建议】`
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(request: AIInterpretationRequest): string {
  const { method, question, hexagram_name, hexagram_info, category } = request

  return `占卜信息：
- 占卜方法：${method === 'liuyao' ? '六爻占卜' : method === 'meihua' ? '梅花易数' : 'AI智能占卜'}
- 问题类型：${category || '综合问题'}
- 具体问题：${question}
- 所得卦象：${hexagram_name}

卦象详情：
- 上卦：${hexagram_info.upperTrigram || '未知'}
- 下卦：${hexagram_info.lowerTrigram || '未知'}
- 卦辞：${hexagram_info.guaci || '暂无'}
${hexagram_info.yaoci ? `- 爻辞：${hexagram_info.yaoci.slice(0, 3).join('；')}` : ''}

请根据以上信息进行专业解读。`
}

/**
 * 调用AI模型
 */
async function callAIModel(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig
): Promise<{
  content: string
  tokenUsage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}> {
  // 这里以OpenAI GPT为例，可以根据实际需要调整
  const requestBody = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  }

  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  }

  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`AI API调用失败: ${errorData.error?.message || response.statusText}`)
  }

  const result = await response.json()

  return {
    content: result.choices[0].message.content,
    tokenUsage: {
      prompt_tokens: result.usage?.prompt_tokens || 0,
      completion_tokens: result.usage?.completion_tokens || 0,
      total_tokens: result.usage?.total_tokens || 0
    }
  }
}