export interface GlobalSettings {
  apiKey: string
  model: string
  baseURL?: string
  defaultTemplateName?: string
  defaultMaxTriggers?: number
  defaultProactiveInterval?: number
  proactiveEnabled?: boolean
  theme?: 'light' | 'dark' | 'auto'
  fontSize?: number
}

export interface UserSettings {
  templateName?: string
  proactiveInterval?: number
  recentMessagesCount?: number
  proactiveEnabled?: boolean
  maxTriggers?: number
  importantInfoThreshold?: number
  theme?: 'light' | 'dark' | 'auto'
  fontSize?: number
}

export interface UserConfig extends GlobalSettings {
  settings?: UserSettings
}

export type ChatResponse = AIResponse

export interface ConversationSettings {
  templateName?: string
  proactiveInterval?: number
  recentMessagesCount?: number
  proactiveEnabled?: boolean
  maxTriggers?: number
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  settings?: ConversationSettings
  /**
   * 会话级记忆（从 AIResponse.important_info 归档）
   */
  memory?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  isProactive?: boolean
}

export interface AIResponse {
  reply: string
  triggers: Trigger[]
  next_api_call_seconds: number
  important_info: string[]
}

export interface Trigger {
  seconds: number
  message: string
}

export interface PromptTemplate {
  id: string
  name: string
  rolePrompt: string
  isBuiltIn: boolean
  createdAt: number
  updatedAt: number
}

export interface PluginHooks {
  onMessageSend?: (message: string) => string | Promise<string>
  onMessageReceive?: (reply: string) => string | Promise<string>
  onTrigger?: (trigger: Trigger) => void | Promise<void>
  onMemoryUpdate?: (importantInfo: string[]) => void | Promise<void>
  onConfigChange?: (config: Record<string, any>) => void | Promise<void>
  onInit?: () => void | Promise<void>
  onDestroy?: () => void | Promise<void>
}

export interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  hooks: PluginHooks
  config?: Record<string, any>
}
