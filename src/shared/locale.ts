export type AppLocale = 'zh-CN' | 'en-US'

export function normalizeLocale(input: unknown): AppLocale {
  const v = String(input || '').trim()
  if (v === 'en' || v === 'en-US') return 'en-US'
  if (v === 'zh' || v === 'zh-CN') return 'zh-CN'
  return 'zh-CN'
}

export function defaultConversationTitle(locale: AppLocale): string {
  return locale === 'en-US' ? 'New chat' : '新对话'
}

export function isDefaultConversationTitle(title: unknown): boolean {
  const t = typeof title === 'string' ? title.trim() : ''
  return t === '新对话' || t === 'New chat'
}

