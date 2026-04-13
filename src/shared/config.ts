import {
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  DEFAULT_SETTINGS,
  DEFAULT_MAX_TRIGGERS,
  DEFAULT_PROACTIVE_INTERVAL,
  DEFAULT_PROACTIVE_ENABLED,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_THEME,
  DEFAULT_FONT_SIZE,
  IMPORTANT_INFO_EXTRACTION_RULES,
  RESPONSE_FORMAT_REQUIREMENTS,
  RESPONSE_FORMAT_EXAMPLE,
  MAX_TRIGGERS,
  PROACTIVE_RULES,
} from './constants'
import { PROMPT_TEMPLATES } from './prompt-templates'

export {
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  DEFAULT_SETTINGS,
  DEFAULT_MAX_TRIGGERS,
  DEFAULT_PROACTIVE_INTERVAL,
  DEFAULT_PROACTIVE_ENABLED,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_THEME,
  DEFAULT_FONT_SIZE,
  IMPORTANT_INFO_EXTRACTION_RULES,
  RESPONSE_FORMAT_REQUIREMENTS,
  RESPONSE_FORMAT_EXAMPLE,
  MAX_TRIGGERS,
  PROACTIVE_RULES,
  PROMPT_TEMPLATES,
}

export function buildSystemPrompt(
  rolePrompt: string,
  maxTriggers: number = DEFAULT_MAX_TRIGGERS
): string {
  return `${rolePrompt}

每次回复用户后，你需要决定：
1. 即时回复用户的问题
2. 是否需要主动发消息给用户？
3. 如果要，设置多个触发点（可选，最多${maxTriggers}个）

${PROACTIVE_RULES}

${IMPORTANT_INFO_EXTRACTION_RULES}

${RESPONSE_FORMAT_REQUIREMENTS}

返回格式示例：
${RESPONSE_FORMAT_EXAMPLE}

注意：
- reply是即时回复，triggers是预设的主动消息列表
- next_api_call_seconds是所有triggers完成后再次调用API的时间
- important_info只提取当前用户消息中的信息，不要回顾历史`
}

export function getTemplateSystemPrompt(
  templateKey: string,
  maxTriggers: number = DEFAULT_MAX_TRIGGERS
): string {
  const template = PROMPT_TEMPLATES[templateKey]
  if (!template) {
    return buildSystemPrompt(`你是一个主动的AI助手。`, maxTriggers)
  }
  return buildSystemPrompt(template.rolePrompt, maxTriggers)
}
