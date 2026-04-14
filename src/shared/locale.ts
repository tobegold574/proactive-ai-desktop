export type AppLocale = 'zh-CN' | 'en-US'

export const DEFAULT_LOCALE: AppLocale = 'zh-CN'

export function normalizeLocale(v: string | undefined | null): AppLocale {
  return v === 'en-US' ? 'en-US' : 'zh-CN'
}

const DEFAULT_TITLES_ZH = new Set(['新对话'])
const DEFAULT_TITLES_EN = new Set(['New chat'])

export function isDefaultConversationTitle(title: string): boolean {
  return DEFAULT_TITLES_ZH.has(title) || DEFAULT_TITLES_EN.has(title)
}

export function defaultConversationTitle(locale: AppLocale): string {
  return locale === 'en-US' ? 'New chat' : '新对话'
}
