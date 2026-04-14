import { GlobalSettings } from './types'
import { DEFAULT_TEMPLATE_NAME } from './constants'
import { normalizeLocale, type AppLocale } from './locale'

/** legacy key / display name / old default → stable builtin id */
const LEGACY_TEMPLATE_REF_MAP: Record<string, string> = {
  default: 'builtin_default',
  默认助手: 'builtin_default',
  tsundere: 'builtin_tsundere',
  傲娇女仆: 'builtin_tsundere',
  gentle: 'builtin_gentle',
  温柔姐姐: 'builtin_gentle',
  energetic: 'builtin_energetic',
  元气少女: 'builtin_energetic',
  professional: 'builtin_professional',
  专业顾问: 'builtin_professional',
}

export function migrateTemplateRef(ref: string | undefined): string {
  if (!ref) return DEFAULT_TEMPLATE_NAME
  if (ref.startsWith('builtin_')) return ref
  const mapped = LEGACY_TEMPLATE_REF_MAP[ref]
  if (mapped) return mapped
  return ref
}

export function migrateGlobalSettings(config: GlobalSettings): GlobalSettings {
  const locale: AppLocale = normalizeLocale(config.locale)
  return {
    ...config,
    locale,
    defaultTemplateName: migrateTemplateRef(config.defaultTemplateName),
  }
}
