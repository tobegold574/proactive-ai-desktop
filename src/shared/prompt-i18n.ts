import type { AppLocale } from './locale'
import { PROMPT_TEMPLATES } from './prompt-templates'

const FALLBACK_ROLE_PROMPT: Record<AppLocale, string> = {
  'zh-CN': '你是一个专业、友好的 AI 助手。请在回答时保持清晰、准确，并在必要时主动提醒风险与下一步。',
  'en-US': 'You are a professional and friendly AI assistant. Be clear and accurate, and proactively highlight risks and next steps when needed.',
}

/**
 * Returns the role prompt for a built-in template key.
 * For now, built-in templates are primarily zh-CN; en-US falls back to the zh rolePrompt when unavailable.
 */
export function getBuiltinRolePrompt(key: string, locale: AppLocale): string {
  const hit = (PROMPT_TEMPLATES as any)?.[key]?.rolePrompt
  if (typeof hit === 'string' && hit.trim()) return hit
  return getFallbackRolePrompt(locale)
}

export function getFallbackRolePrompt(locale: AppLocale): string {
  return FALLBACK_ROLE_PROMPT[locale] ?? FALLBACK_ROLE_PROMPT['zh-CN']
}

export function modelEmptyResponseMessage(locale: AppLocale): string {
  if (locale === 'en-US') {
    return "Sorry — I didn't get a valid response from the model. Please try again."
  }
  return '抱歉，我没有收到模型的有效回复，请稍后重试。'
}

export function getImportantInfoSystemPrefix(locale: AppLocale): string {
  if (locale === 'en-US') {
    return 'Important info (user context / preferences): '
  }
  return '重要信息（用户背景/偏好）：'
}

