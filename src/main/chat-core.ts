import OpenAI from 'openai'
import {
  ChatMessage,
  AIResponse,
  GlobalSettings,
  ConversationSettings,
} from '../shared/types'
import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_MAX_TRIGGERS,
  DEFAULT_PROACTIVE_INTERVAL,
  buildSystemPrompt,
} from '../shared/config'

export class ChatCore {
  /**
   * 发送消息并获取 AI 响应
   */
  async sendMessage(
    userMessage: string,
    history: ChatMessage[],
    importantInfo: string[],
    globalSettings: GlobalSettings,
    conversationSettings?: ConversationSettings,
    rolePrompt?: string
  ): Promise<AIResponse> {
    const apiKey = globalSettings.apiKey || ''
    const model = globalSettings.model || DEFAULT_MODEL
    const baseURL = globalSettings.baseURL || DEFAULT_BASE_URL

    const maxTriggers =
      conversationSettings?.maxTriggers ||
      globalSettings.defaultMaxTriggers ||
      DEFAULT_MAX_TRIGGERS
    const proactiveInterval =
      conversationSettings?.proactiveInterval ||
      globalSettings.defaultProactiveInterval ||
      DEFAULT_PROACTIVE_INTERVAL

    const finalRolePrompt = rolePrompt || '你是一个主动的AI助手。'
    const systemPrompt = buildSystemPrompt(finalRolePrompt, maxTriggers)

    const settings = {
      recentMessagesCount: conversationSettings?.recentMessagesCount || 3,
      proactiveInterval,
    }

    const response = await this.callAI(
      userMessage,
      history,
      importantInfo,
      apiKey,
      model,
      baseURL,
      systemPrompt,
      settings
    )

    return response
  }

  /**
   * 验证 API 配置是否有效
   */
  async validateConfig(config: GlobalSettings): Promise<boolean> {
    const apiKey = config.apiKey
    const baseURL = config.baseURL || DEFAULT_BASE_URL

    if (!apiKey) {
      throw new Error('API Key is required')
    }

    try {
      const client = new OpenAI({
        apiKey,
        baseURL,
      })

      await client.models.list()
      return true
    } catch (error) {
      console.error('Error validating config:', error)
      throw error
    }
  }

  /**
   * 调用 AI API
   */
  private async callAI(
    userMessage: string,
    history: ChatMessage[],
    importantInfo: string[],
    apiKey: string,
    modelId: string,
    baseURL: string,
    systemPrompt: string,
    settings: { recentMessagesCount?: number; proactiveInterval?: number }
  ): Promise<AIResponse> {
    const client = new OpenAI({
      apiKey,
      baseURL,
    })

    const recentMessagesCount = settings.recentMessagesCount || 3

    const messages = this.buildMessages(
      systemPrompt,
      history,
      importantInfo,
      recentMessagesCount
    )
    messages.push({ role: 'user', content: userMessage })

    const response = await client.chat.completions.create({
      model: modelId,
      messages,
    })

    const content = response?.choices?.[0]?.message?.content
    if (typeof content !== 'string' || content.trim().length === 0) {
      // 某些代理/网关在异常情况下可能返回 choices=null 或空数组
      return {
        reply: '错误：模型返回了空响应（choices 为空），请稍后重试或更换模型/Base URL。',
        triggers: [],
        next_api_call_seconds: settings.proactiveInterval || DEFAULT_PROACTIVE_INTERVAL,
        important_info: [],
      }
    }

    let resultText = content || '{}'

    resultText = resultText.trim()
    if (resultText.startsWith('```')) {
      const firstLineEnd = resultText.indexOf('\n')
      if (firstLineEnd !== -1) {
        resultText = resultText.substring(firstLineEnd + 1)
      }
    }
    if (resultText.endsWith('```')) {
      resultText = resultText.substring(0, resultText.length - 3)
    }
    resultText = resultText.trim()

    const safeParse = (text: string): any => {
      // 1) 直接解析
      try {
        return JSON.parse(text)
      } catch {}
      // 2) 提取第一段 {...}（模型偶发输出解释文字）
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        const slice = text.slice(start, end + 1)
        try {
          return JSON.parse(slice)
        } catch {}
      }
      return null
    }

    const result = safeParse(resultText)
    if (!result) {
      // 降级：不阻断对话（避免 “Unexpected token … is not valid JSON”）
      return {
        reply: resultText,
        triggers: [],
        next_api_call_seconds: settings.proactiveInterval || DEFAULT_PROACTIVE_INTERVAL,
        important_info: [],
      }
    }

    return {
      reply: result.reply || '',
      triggers: result.triggers || [],
      next_api_call_seconds:
        result.next_api_call_seconds ||
        settings.proactiveInterval ||
        DEFAULT_PROACTIVE_INTERVAL,
      important_info: result.important_info || [],
    }
  }

  /**
   * 构建消息列表
   */
  private buildMessages(
    systemPrompt: string,
    history: ChatMessage[],
    importantInfo: string[],
    recentMessagesCount: number = 3
  ) {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    if (importantInfo.length > 0) {
      messages.push({
        role: 'system',
        content: `[用户重要信息] ${importantInfo.join('; ')}`,
      })
    }

    const recentCount = recentMessagesCount || 3
    for (const msg of history.slice(-recentCount)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      })
    }

    return messages
  }
}
